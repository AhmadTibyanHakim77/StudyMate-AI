import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type RouteContext = { params: Promise<{ quizId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to open this quiz.' }, { status: 401 });
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true, title: true, createdAt: true, material: { select: { title: true } }, questions: { select: { id: true, prompt: true, options: true } } },
  });
  if (!quiz) return NextResponse.json({ message: 'Quiz not found.' }, { status: 404 });
  return NextResponse.json({ quiz });
}
