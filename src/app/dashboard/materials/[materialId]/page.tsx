import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Brain, Download, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import prisma from '@/lib/prisma';

type PageContext = { params: Promise<{ materialId: string }> };

export default async function MaterialDetailPage({ params }: PageContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const { materialId } = await params;
  const material = await prisma.material.findFirst({ where: { id: materialId, userId } });
  if (!material) notFound();

  const excerpt = material.extractedText?.slice(0, 18000) ?? '';
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/dashboard/materials" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All materials</Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0"><p className="text-sm font-medium text-primary">MATERIAL DETAIL</p><h1 className="mt-1 break-words text-3xl font-semibold">{material.title}</h1><p className="mt-2 text-sm text-muted-foreground">{material.fileName} · {material.pageCount ?? 'Unknown'} pages · {material.status}</p></div>
        {material.status === 'completed' && <a href={`/api/materials/${material.id}/file`} target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Open PDF</Button></a>}
      </header>

      {material.status === 'completed' ? (
        <>
          <section className="flex flex-wrap gap-2" aria-label="Study actions">
            <Link href={`/dashboard/summaries?materialId=${material.id}`}><Button variant="outline" className="gap-2"><Sparkles className="h-4 w-4" />Create summary</Button></Link>
            <Link href={`/dashboard/quizzes?materialId=${material.id}`}><Button variant="outline" className="gap-2"><Brain className="h-4 w-4" />Create quiz</Button></Link>
            <Link href={`/dashboard/tutor?materialId=${material.id}`}><Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" />Ask tutor</Button></Link>
          </section>
          <section className="border-t border-border pt-6">
            <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Extracted text</h2></div>
            <p className="mt-2 text-sm text-muted-foreground">Text is available to your study tools and only visible to your account.</p>
            <pre className="mt-4 max-h-[65vh] overflow-auto whitespace-pre-wrap break-words rounded-md border border-border bg-card p-4 text-sm leading-6">{excerpt}{material.extractedText && material.extractedText.length > excerpt.length ? '\n\nPreview limited to 18,000 characters.' : ''}</pre>
          </section>
        </>
      ) : (
        <section className="border-y border-border py-8"><h2 className="font-semibold">Processing {material.status === 'failed' ? 'failed' : 'is in progress'}</h2><p className="mt-2 text-sm text-muted-foreground">{material.status === 'failed' ? 'This file could not be processed. Delete it and try a readable, text-based PDF.' : 'Refresh this page in a moment to check the latest status.'}</p></section>
      )}
    </div>
  );
}
