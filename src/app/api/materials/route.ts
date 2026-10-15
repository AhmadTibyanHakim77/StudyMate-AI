import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { extractPdf, splitDocumentText } from '@/lib/documents/pdf';
import { StorageConfigurationError, deletePrivatePdf, storePrivatePdf } from '@/lib/storage';

export const runtime = 'nodejs';

const uploadTitleSchema = z.string().trim().min(1).max(120);
const defaultMaxFileSizeMb = 10;

function getMaxFileSizeBytes(): number {
  const configured = Number(process.env.MAX_FILE_SIZE_MB);
  const megabytes = Number.isFinite(configured) && configured > 0 ? Math.min(configured, 25) : defaultMaxFileSizeMb;
  return megabytes * 1024 * 1024;
}

function isPdfHeader(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to view your materials.' }, { status: 401 });

  const search = new URL(request.url).searchParams.get('search')?.trim().slice(0, 100);
  const materials = await prisma.material.findMany({
    where: {
      userId,
      ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { fileName: { contains: search, mode: 'insensitive' } }] } : {}),
    },
    select: {
      id: true,
      title: true,
      fileName: true,
      fileSize: true,
      status: true,
      pageCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({ materials });
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to upload materials.' }, { status: 401 });

  const maxFileSize = getMaxFileSizeBytes();
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxFileSize + 256 * 1024) {
    return NextResponse.json({ message: `PDF must be no larger than ${Math.floor(maxFileSize / 1024 / 1024)} MB.` }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: 'Upload request could not be read.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Choose a PDF file to upload.' }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ message: 'The selected PDF is empty.' }, { status: 400 });
  if (file.size > maxFileSize) {
    return NextResponse.json({ message: `PDF must be no larger than ${Math.floor(maxFileSize / 1024 / 1024)} MB.` }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type !== 'application/pdf' || !isPdfHeader(bytes)) {
    return NextResponse.json({ message: 'The uploaded file is not a valid PDF.' }, { status: 415 });
  }

  const safeFileName = file.name.split(/[\\/]/).pop()?.slice(0, 255) || 'study-material.pdf';
  const titleResult = uploadTitleSchema.safeParse(formData.get('title') || safeFileName.replace(/\.pdf$/i, ''));
  if (!titleResult.success) {
    return NextResponse.json({ message: 'Material title must be between 1 and 120 characters.' }, { status: 400 });
  }

  let material;
  try {
    material = await prisma.material.create({
      data: {
        userId,
        title: titleResult.data,
        fileUrl: '',
        fileName: safeFileName,
        fileSize: file.size,
        mimeType: 'application/pdf',
        status: 'processing',
      },
      select: { id: true },
    });
  } catch (error) {
    console.error('Material record creation failed.', { errorName: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ message: 'The material could not be saved. Please try again.' }, { status: 500 });
  }

  let fileLocator: string | null = null;
  let processingStage = 'pdf_extraction';
  try {
    const extracted = await extractPdf(bytes.slice());
    if (!extracted.text) {
      await prisma.material.update({ where: { id: material.id }, data: { status: 'failed' } });
      return NextResponse.json({ message: 'This PDF contains no selectable text and could not be processed.' }, { status: 422 });
    }

    const chunks = splitDocumentText(extracted.text);
    if (chunks.length === 0) {
      await prisma.material.update({ where: { id: material.id }, data: { status: 'failed' } });
      return NextResponse.json({ message: 'No readable study content was found in this PDF.' }, { status: 422 });
    }

    processingStage = 'private_storage';
    fileLocator = await storePrivatePdf(bytes);
    processingStage = 'database_persist';
    await prisma.$transaction([
      prisma.material.update({
        where: { id: material.id, userId },
        data: { fileUrl: fileLocator, extractedText: extracted.text, pageCount: extracted.pageCount, status: 'completed' },
      }),
      prisma.documentChunk.createMany({
        data: chunks.map((content, chunkIndex) => ({ materialId: material.id, content, chunkIndex })),
      }),
    ]);

    return NextResponse.json({ material: { id: material.id, title: titleResult.data, status: 'completed', pageCount: extracted.pageCount } }, { status: 201 });
  } catch (error: unknown) {
    if (fileLocator) {
      try {
        await deletePrivatePdf(fileLocator);
      } catch {
        console.error('Failed to clean up an uncommitted material file.', { materialId: material.id });
      }
    }
    try {
      await prisma.material.update({ where: { id: material.id, userId }, data: { status: 'failed' } });
    } catch {
      console.error('Failed to update material processing status.', { materialId: material.id });
    }

    if (error instanceof StorageConfigurationError) {
      return NextResponse.json({ message: 'Private file storage is not configured for this environment.' }, { status: 503 });
    }
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Material database connection failed.', { errorName: error.name, clientVersion: error.clientVersion });
      return NextResponse.json({ message: 'The database is unavailable. Please try again later.' }, { status: 503 });
    }

    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const prismaCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
    const typeErrorMessage = error instanceof TypeError ? error.message.slice(0, 200) : undefined;
    console.error('PDF processing failed.', { materialId: material.id, processingStage, errorName, prismaCode, typeErrorMessage });
    return NextResponse.json({ message: 'The PDF could not be processed. Check that it is readable and try another file.' }, { status: 422 });
  }
}
