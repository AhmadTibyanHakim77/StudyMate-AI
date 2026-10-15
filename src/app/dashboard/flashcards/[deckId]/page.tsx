import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { FlashcardViewer } from '@/components/flashcards/FlashcardViewer';

type PageProps = { params: Promise<{ deckId: string }> };

export default async function FlashcardDeckPage({ params }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const { deckId } = await params;
  const deck = await prisma.flashcardDeck.findFirst({
    where: { id: deckId, userId },
    select: { id: true, title: true, material: { select: { title: true } }, flashcards: { select: { id: true, question: true, answer: true, reviews: { where: { userId }, orderBy: { reviewedAt: 'desc' }, take: 1, select: { quality: true, reviewedAt: true } } } } },
  });
  if (!deck) notFound();
  return <FlashcardViewer deck={{
    ...deck,
    materialTitle: deck.material?.title ?? null,
    flashcards: deck.flashcards.map((card) => ({
      ...card,
      reviews: card.reviews.map((review) => ({ ...review, reviewedAt: review.reviewedAt.toISOString() })),
    })),
  }} />;
}
