'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review { quality: number; reviewedAt: string }
interface Flashcard { id: string; question: string; answer: string; reviews: Review[] }
interface Deck { id: string; title: string; materialTitle: string | null; flashcards: Flashcard[] }
const ratings = [{ quality: 0, label: 'Again' }, { quality: 1, label: 'Hard' }, { quality: 2, label: 'Good' }, { quality: 3, label: 'Easy' }];

export function FlashcardViewer({ deck }: { deck: Deck }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const card = deck.flashcards[index];
  if (!card) return <div className="py-10 text-center text-muted-foreground">This deck has no cards.</div>;

  async function saveReview(quality: number) {
    setError('');
    try {
      const response = await fetch(`/api/flashcards/${deck.id}/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flashcardId: card.id, quality }) });
      const result = await response.json().catch(() => null) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message ?? 'Review progress could not be saved.');
      setReviewed((current) => ({ ...current, [card.id]: quality }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Review progress could not be saved.');
    }
  }

  function move(direction: number) {
    setIndex((current) => (current + direction + deck.flashcards.length) % deck.flashcards.length);
    setFlipped(false);
    setError('');
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link href="/dashboard/flashcards" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All decks</Link>
      <header className="border-b border-border pb-5"><p className="text-sm font-medium text-primary">{deck.materialTitle ?? 'Study deck'}</p><h1 className="mt-1 text-3xl font-semibold">{deck.title}</h1><p className="mt-2 text-sm text-muted-foreground">Card {index + 1} of {deck.flashcards.length}</p></header>
      <button type="button" onClick={() => setFlipped((value) => !value)} aria-label={flipped ? 'Show question' : 'Show answer'} className="flex min-h-72 w-full flex-col items-center justify-center border border-border bg-card px-6 py-10 text-center hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-80">
        <span className="text-xs font-semibold uppercase text-primary">{flipped ? 'Answer' : 'Question'}</span>
        <span className="mt-5 max-w-2xl whitespace-pre-wrap text-xl font-medium leading-8">{flipped ? card.answer : card.question}</span>
        <span className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" />Tap to flip</span>
      </button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {flipped && <section className="space-y-3"><p className="text-sm text-muted-foreground">How well did you recall it?</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{ratings.map(({ quality, label }) => <Button key={quality} type="button" variant={reviewed[card.id] === quality ? 'default' : 'outline'} onClick={() => void saveReview(quality)}>{label}</Button>)}</div></section>}
      <nav aria-label="Flashcard navigation" className="flex items-center justify-between"><Button type="button" variant="outline" onClick={() => move(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Previous</Button><Button type="button" variant="outline" onClick={() => move(1)}>Next<ArrowRight className="ml-2 h-4 w-4" /></Button></nav>
    </div>
  );
}
