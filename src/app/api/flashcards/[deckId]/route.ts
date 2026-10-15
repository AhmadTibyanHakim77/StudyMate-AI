import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type RouteContext = { params: Promise<{ deckId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to open this deck.' }, { status: 401 });
  const { deckId } = await params;
  const deck = await prisma.flashcardDeck.findFirst({
    where: { id: deckId, userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      material: { select: { title: true } },
      flashcards: {
        select: { id: true, question: true, answer: true, reviews: { where: { userId }, orderBy: { reviewedAt: 'desc' }, take: 1, select: { quality: true, reviewedAt: true } } },
      },
    },
  });
  if (!deck) return NextResponse.json({ message: 'Flashcard deck not found.' }, { status: 404 });
  return NextResponse.json({ deck });
}
