import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type RouteContext = { params: Promise<{ deckId: string }> };
const reviewSchema = z.object({ flashcardId: z.string().cuid(), quality: z.number().int().min(0).max(3) });

export async function POST(request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to save review progress.' }, { status: 401 });
  const { deckId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 }); }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Choose a valid review rating.' }, { status: 400 });

  const card = await prisma.flashcard.findFirst({ where: { id: parsed.data.flashcardId, deckId, deck: { userId } }, select: { id: true } });
  if (!card) return NextResponse.json({ message: 'Flashcard not found.' }, { status: 404 });
  const review = await prisma.flashcardReview.create({ data: { userId, flashcardId: card.id, quality: parsed.data.quality }, select: { id: true, quality: true, reviewedAt: true } });
  return NextResponse.json({ review }, { status: 201 });
}
