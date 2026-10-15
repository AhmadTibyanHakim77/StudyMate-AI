'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialOption { id: string; title: string }
interface SummaryItem { id: string; title: string; materialId: string; materialTitle: string; createdAt: string }
interface SummaryContent { overview: string; keyTopics: string[]; importantConcepts: string[]; definitions: { term: string; definition: string }[]; takeaways: string[]; conclusion: string }

export function SummaryCenter({ materials, summaries, initialMaterialId }: { materials: MaterialOption[]; summaries: SummaryItem[]; initialMaterialId?: string }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [materialId, setMaterialId] = useState(initialMaterialId || materials[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<SummaryContent | null>(null);
  const [savedSummaryId, setSavedSummaryId] = useState('');

  async function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || !materialId) return;
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const response = await fetch('/api/summaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ materialId }) });
      const result = await response.json().catch(() => null) as { message?: string; summary?: { id: string; content: SummaryContent } } | null;
      if (!response.ok || !result?.summary) {
        setError(result?.message ?? 'Summary could not be generated.');
        return;
      }
      setSummary(result.summary.content);
      setSavedSummaryId(result.summary.id);
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
      <header><p className="text-sm font-medium text-primary">AI STUDY TOOLS</p><h1 className="mt-1 text-3xl font-semibold">AI Summaries</h1><p className="mt-2 text-sm text-muted-foreground">Create a structured summary from one of your processed materials.</p></header>
      <section className="flex flex-wrap items-end gap-4 border-y border-border py-5">
        <form onSubmit={generate} className="flex w-full max-w-2xl flex-wrap items-end gap-3" aria-busy={loading}>
          <div className="min-w-56 flex-1 space-y-2"><label htmlFor="summary-material" className="text-sm font-medium">Source material</label><select id="summary-material" value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={loading || materials.length === 0} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Select a processed PDF</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.title}</option>)}</select></div>
          <Button type="submit" disabled={loading || !materialId} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{loading ? 'Generating…' : 'Generate summary'}</Button>
        </form>
      </section>
      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {materials.length === 0 && <div className="border-y border-border py-8 text-center"><p className="text-sm text-muted-foreground">Upload and process a PDF before generating a summary.</p><Link href="/dashboard/materials" className="mt-2 inline-block text-sm text-primary hover:underline">Open My Materials</Link></div>}

      {summary && <article className="space-y-6 border-b border-border pb-8" aria-live="polite">
        {savedSummaryId && <p className="text-sm text-green-700 dark:text-green-300">Summary generated and saved. <Link href={`/dashboard/summaries/${savedSummaryId}`} className="underline">Open saved summary</Link></p>}
        <section><h2 className="text-xl font-semibold">Overview</h2><p className="mt-2 leading-7 text-muted-foreground">{summary.overview}</p></section>
        <section><h2 className="font-semibold">Key topics</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{summary.keyTopics.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2 className="font-semibold">Important concepts</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{summary.importantConcepts.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {summary.definitions.length > 0 && <section><h2 className="font-semibold">Definitions</h2><dl className="mt-2 divide-y divide-border">{summary.definitions.map(({ term, definition }) => <div key={term} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]"><dt className="font-medium">{term}</dt><dd className="text-muted-foreground">{definition}</dd></div>)}</dl></section>}
        <section><h2 className="font-semibold">Takeaways</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{summary.takeaways.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h2 className="font-semibold">Conclusion</h2><p className="mt-2 leading-7 text-muted-foreground">{summary.conclusion}</p></section>
      </article>}

      <section><h2 className="font-semibold">Saved summaries</h2>{summaries.length ? <ul className="mt-3 divide-y divide-border border-y border-border">{summaries.map((item) => <li key={item.id} className="flex flex-wrap items-center gap-2 py-3"><Link href={`/dashboard/summaries/${item.id}`} className="font-medium hover:text-primary">{item.title}</Link><span className="text-sm text-muted-foreground">from {item.materialTitle}</span><time className="ml-auto text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</time></li>)}</ul> : <p className="mt-3 border-y border-border py-5 text-sm text-muted-foreground">Generated summaries will be saved here.</p>}</section>
    </div>
  );
}
