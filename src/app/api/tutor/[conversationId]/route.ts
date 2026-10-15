import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to view this conversation.' }, { status: 401 });
  const { conversationId } = await params;
  const conversation = await prisma.tutorConversation.findFirst({
    where: { id: conversationId, userId },
    select: {
      id: true,
      title: true,
      materialId: true,
      material: { select: { title: true } },
      messages: {
        select: { id: true, role: true, content: true, sources: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  if (!conversation) return NextResponse.json({ message: 'Conversation not found.' }, { status: 404 });
  return NextResponse.json({ conversation });
}
