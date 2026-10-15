import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { readPrivatePdf } from '@/lib/storage';

type RouteContext = { params: Promise<{ materialId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to access this file.' }, { status: 401 });

  const { materialId } = await params;
  const material = await prisma.material.findFirst({
    where: { id: materialId, userId, status: 'completed' },
    select: { fileUrl: true, fileName: true },
  });
  if (!material?.fileUrl) return NextResponse.json({ message: 'Material file not found.' }, { status: 404 });

  try {
    const bytes = await readPrivatePdf(material.fileUrl);
    const fileName = (material.fileName || 'study-material.pdf').replace(/[\r\n"\\]/g, '_');
    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Private material file retrieval failed.', { materialId, errorName: error instanceof Error ? error.name : 'UnknownError' });
    return NextResponse.json({ message: 'The material file is temporarily unavailable.' }, { status: 503 });
  }
}
