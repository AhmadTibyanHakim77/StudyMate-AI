import { FlashcardCenter } from '@/components/flashcards/FlashcardCenter';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { searchParams: Promise<{ materialId?: string }> };

export default async function FlashcardsPage({ searchParams }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const [{ materialId }, materials, decks] = await Promise.all([
    searchParams,
    prisma.material.findMany({ where: { userId, status: 'completed' }, select: { id: true, title: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.flashcardDeck.findMany({ where: { userId }, select: { id: true, title: true, materialId: true, createdAt: true, material: { select: { title: true } }, _count: { select: { flashcards: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  return <FlashcardCenter initialMaterialId={materialId} materials={materials} decks={decks.map((deck) => ({ id: deck.id, title: deck.title, materialTitle: deck.material?.title ?? null, cardCount: deck._count.flashcards, createdAt: deck.createdAt.toISOString() }))} />;
}
