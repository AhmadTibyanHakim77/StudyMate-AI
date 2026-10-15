import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { params: Promise<{ summaryId: string }> };
type SummaryContent = { overview?: string; keyTopics?: string[]; importantConcepts?: string[]; definitions?: { term: string; definition: string }[]; takeaways?: string[]; conclusion?: string };

export default async function SummaryDetailPage({ params }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const { summaryId } = await params;
  const item = await prisma.summary.findFirst({ where: { id: summaryId, userId }, include: { material: { select: { title: true } } } });
  if (!item) notFound();
  let content: SummaryContent | null = null;
  try { content = JSON.parse(item.content) as SummaryContent; } catch { content = null; }

  return (
    <article className="mx-auto max-w-4xl space-y-7">
      <Link href="/dashboard/summaries" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Summaries</Link>
      <header className="border-b border-border pb-5"><p className="text-sm font-medium text-primary">{item.material.title}</p><h1 className="mt-1 text-3xl font-semibold">{item.title}</h1><time className="mt-2 block text-sm text-muted-foreground">{item.createdAt.toLocaleDateString()}</time></header>
      {content ? <div className="space-y-6">
        {content.overview && <section><h2 className="font-semibold">Overview</h2><p className="mt-2 leading-7 text-muted-foreground">{content.overview}</p></section>}
        {content.keyTopics?.length ? <section><h2 className="font-semibold">Key topics</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{content.keyTopics.map((text) => <li key={text}>{text}</li>)}</ul></section> : null}
        {content.importantConcepts?.length ? <section><h2 className="font-semibold">Important concepts</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{content.importantConcepts.map((text) => <li key={text}>{text}</li>)}</ul></section> : null}
        {content.definitions?.length ? <section><h2 className="font-semibold">Definitions</h2><dl className="mt-2 divide-y divide-border">{content.definitions.map(({ term, definition }) => <div key={term} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]"><dt className="font-medium">{term}</dt><dd className="text-muted-foreground">{definition}</dd></div>)}</dl></section> : null}
        {content.takeaways?.length ? <section><h2 className="font-semibold">Takeaways</h2><ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">{content.takeaways.map((text) => <li key={text}>{text}</li>)}</ul></section> : null}
        {content.conclusion && <section><h2 className="font-semibold">Conclusion</h2><p className="mt-2 leading-7 text-muted-foreground">{content.conclusion}</p></section>}
      </div> : <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>}
    </article>
  );
}
