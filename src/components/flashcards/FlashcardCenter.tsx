'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialOption { id: string; title: string }
interface DeckItem { id: string; title: string; materialTitle: string | null; cardCount: number; createdAt: string }

export function FlashcardCenter({ materials, decks, initialMaterialId }: { materials: MaterialOption[]; decks: DeckItem[]; initialMaterialId?: string }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [materialId, setMaterialId] = useState(initialMaterialId || materials[0]?.id || '');
  const [cardCount, setCardCount] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdDeckId, setCreatedDeckId] = useState('');

  async function createDeck(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || !materialId) return;
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/flashcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ materialId, cardCount }) });
      const result = await response.json().catch(() => null) as { message?: string; deck?: { id: string } } | null;
      if (!response.ok || !result?.deck) {
        setError(result?.message ?? 'Deck could not be generated.');
        return;
      }
      setCreatedDeckId(result.deck.id);
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header><p className="text-sm font-medium text-primary">ACTIVE RECALL</p><h1 className="mt-1 text-3xl font-semibold">Flashcards</h1><p className="mt-2 text-sm text-muted-foreground">Review concepts from your own processed materials.</p></header>
      <section className="border-y border-border py-5"><form onSubmit={createDeck} aria-busy={loading} className="flex flex-wrap items-end gap-3">
        <div className="min-w-56 flex-1 space-y-2"><label htmlFor="flashcard-material" className="text-sm font-medium">Source material</label><select id="flashcard-material" value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={loading || materials.length === 0} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Select a processed PDF</option>{materials.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
        <div className="space-y-2"><label htmlFor="flashcard-count" className="text-sm font-medium">Cards</label><select id="flashcard-count" value={cardCount} onChange={(event) => setCardCount(Number(event.target.value))} disabled={loading} className="h-10 rounded-md border border-input bg-background px-3 text-sm">{[5, 8, 12, 16, 20, 30].map((count) => <option key={count} value={count}>{count}</option>)}</select></div>
        <Button type="submit" disabled={loading || !materialId} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}{loading ? 'Creating…' : 'Generate deck'}</Button>
      </form></section>
      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {createdDeckId && <p role="status" className="text-sm text-green-700 dark:text-green-300">Deck saved. <Link href={`/dashboard/flashcards/${createdDeckId}`} className="underline">Start reviewing</Link></p>}
      {materials.length === 0 && <div className="border-y border-border py-8 text-center"><p className="text-sm text-muted-foreground">Upload a processed PDF before creating a deck.</p><Link href="/dashboard/materials" className="mt-2 inline-block text-sm text-primary hover:underline">Open My Materials</Link></div>}
      <section><h2 className="font-semibold">Your decks</h2>{decks.length ? <ul className="mt-3 divide-y divide-border border-y border-border">{decks.map((deck) => <li key={deck.id} className="flex flex-wrap items-center gap-3 py-3"><Layers className="h-4 w-4 text-primary" /><Link href={`/dashboard/flashcards/${deck.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-primary">{deck.title}</Link><span className="text-sm text-muted-foreground">{deck.cardCount} cards{deck.materialTitle ? ` · ${deck.materialTitle}` : ''}</span><time className="text-xs text-muted-foreground">{new Date(deck.createdAt).toLocaleDateString()}</time></li>)}</ul> : <p className="mt-3 border-y border-border py-5 text-sm text-muted-foreground">Your saved decks will appear here.</p>}</section>
    </div>
  );
}
