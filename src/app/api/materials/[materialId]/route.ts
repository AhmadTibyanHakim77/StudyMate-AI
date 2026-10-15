import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { deletePrivatePdf } from '@/lib/storage';

type RouteContext = { params: Promise<{ materialId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to view this material.' }, { status: 401 });

  const { materialId } = await params;
  const material = await prisma.material.findFirst({
    where: { id: materialId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      status: true,
      pageCount: true,
      extractedText: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!material) return NextResponse.json({ message: 'Material not found.' }, { status: 404 });
  return NextResponse.json({ material });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to delete this material.' }, { status: 401 });

  const { materialId } = await params;
  const material = await prisma.material.findFirst({ where: { id: materialId, userId }, select: { id: true, fileUrl: true } });
  if (!material) return NextResponse.json({ message: 'Material not found.' }, { status: 404 });

  await prisma.material.delete({ where: { id: material.id } });
  if (material.fileUrl) {
    try {
      await deletePrivatePdf(material.fileUrl);
    } catch (error) {
      console.error('Deleted material file cleanup failed.', { materialId, errorName: error instanceof Error ? error.name : 'UnknownError' });
    }
  }

  return NextResponse.json({ message: 'Material deleted.' });
}
