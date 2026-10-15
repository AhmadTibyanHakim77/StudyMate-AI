'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MaterialOption { id: string; title: string }
interface QuizItem { id: string; title: string; materialId: string; materialTitle: string; createdAt: string; questionCount: number; attemptCount: number }

export function QuizCenter({ materials, quizzes, initialMaterialId }: { materials: MaterialOption[]; quizzes: QuizItem[]; initialMaterialId?: string }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [materialId, setMaterialId] = useState(initialMaterialId || materials[0]?.id || '');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQuizId, setCreatedQuizId] = useState('');

  async function createQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || !materialId) return;
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ materialId, questionCount }) });
      const result = await response.json().catch(() => null) as { message?: string; quiz?: { id: string } } | null;
      if (!response.ok || !result?.quiz) {
        setError(result?.message ?? 'Quiz could not be created.');
        return;
      }
      setCreatedQuizId(result.quiz.id);
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
      <header><p className="text-sm font-medium text-primary">PRACTICE & REVIEW</p><h1 className="mt-1 text-3xl font-semibold">Quiz Center</h1><p className="mt-2 text-sm text-muted-foreground">Create quizzes from processed study materials and track your results.</p></header>
      <section className="border-y border-border py-5">
        <form onSubmit={createQuiz} aria-busy={loading} className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1 space-y-2"><label htmlFor="quiz-material" className="text-sm font-medium">Source material</label><select id="quiz-material" value={materialId} onChange={(event) => setMaterialId(event.target.value)} disabled={loading || materials.length === 0} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">Select a processed PDF</option>{materials.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
          <div className="space-y-2"><label htmlFor="question-count" className="text-sm font-medium">Questions</label><select id="question-count" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} disabled={loading} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{[3, 5, 8, 10, 12].map((count) => <option key={count} value={count}>{count}</option>)}</select></div>
          <Button type="submit" disabled={loading || !materialId} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}{loading ? 'Creating…' : 'Generate quiz'}</Button>
        </form>
      </section>
      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {createdQuizId && <p role="status" className="text-sm text-green-700 dark:text-green-300">Quiz saved. <Link className="underline" href={`/dashboard/quizzes/${createdQuizId}`}>Start quiz</Link></p>}
      {materials.length === 0 && <div className="border-y border-border py-8 text-center"><p className="text-sm text-muted-foreground">Upload and process a PDF before making a quiz.</p><Link href="/dashboard/materials" className="mt-2 inline-block text-sm text-primary hover:underline">Open My Materials</Link></div>}
      <section><h2 className="font-semibold">Your quizzes</h2>{quizzes.length ? <ul className="mt-3 divide-y divide-border border-y border-border">{quizzes.map((quiz) => <li key={quiz.id} className="flex flex-wrap items-center gap-3 py-3"><Brain className="h-4 w-4 text-primary" /><Link href={`/dashboard/quizzes/${quiz.id}`} className="min-w-0 flex-1 truncate font-medium hover:text-primary">{quiz.title}</Link><span className="text-sm text-muted-foreground">{quiz.questionCount} questions · {quiz.attemptCount} attempts · {quiz.materialTitle}</span><time className="text-xs text-muted-foreground">{new Date(quiz.createdAt).toLocaleDateString()}</time></li>)}</ul> : <p className="mt-3 border-y border-border py-5 text-sm text-muted-foreground">Your generated quizzes and attempt history will appear here.</p>}</section>
    </div>
  );
}
