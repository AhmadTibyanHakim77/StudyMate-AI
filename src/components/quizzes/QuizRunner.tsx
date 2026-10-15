'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion { id: string; prompt: string; options: string[] }
interface QuizAttemptResult { score: number; correctCount: number; totalQuestions: number; answers: { questionId: string; selected: string; correctAnswer: string; correct: boolean; explanation: string | null }[] }

export function QuizRunner({ quiz }: { quiz: { id: string; title: string; materialTitle: string; questions: QuizQuestion[] } }) {
  const router = useRouter();
  const requestInFlight = useRef(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current || result) return;
    if (Object.keys(answers).length !== quiz.questions.length) {
      setError('Answer every question before submitting.');
      return;
    }
    requestInFlight.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
      const payload = await response.json().catch(() => null) as { message?: string; attempt?: QuizAttemptResult } | null;
      if (!response.ok || !payload?.attempt) {
        setError(payload?.message ?? 'Quiz could not be submitted.');
        return;
      }
      setResult(payload.attempt);
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <Link href="/dashboard/quizzes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Quiz Center</Link>
      <header className="border-b border-border pb-5"><p className="text-sm font-medium text-primary">{quiz.materialTitle}</p><h1 className="mt-1 text-3xl font-semibold">{quiz.title}</h1><p className="mt-2 text-sm text-muted-foreground">{quiz.questions.length} questions</p></header>
      {result && <section role="status" className="border-y border-border py-5"><p className="text-sm text-muted-foreground">Your score</p><p className="mt-1 text-4xl font-semibold tabular-nums">{result.score}%</p><p className="mt-1 text-sm">{result.correctCount} of {result.totalQuestions} correct</p></section>}
      {error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <form onSubmit={submit} className="space-y-7" aria-busy={loading}>
        {quiz.questions.map((question, index) => {
          const feedback = result?.answers.find((answer) => answer.questionId === question.id);
          return <fieldset key={question.id} disabled={loading || Boolean(result)} className="space-y-3 border-b border-border pb-6"><legend className="font-medium leading-6"><span className="mr-2 text-primary">{index + 1}.</span>{question.prompt}</legend><div className="grid gap-2">{question.options.map((option, optionIndex) => <label key={`${question.id}-${optionIndex}`} className={`flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 text-sm ${answers[question.id] === optionIndex ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'} ${feedback?.correctAnswer === option ? 'border-green-600/50 bg-green-600/5' : ''}`}><input type="radio" name={question.id} value={optionIndex} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} className="mt-0.5 accent-primary" /><span className="flex-1">{option}</span>{feedback?.correctAnswer === option && <Check className="h-4 w-4 shrink-0 text-green-600" />}{feedback?.selected === option && !feedback.correct && <X className="h-4 w-4 shrink-0 text-destructive" />}</label>)}</div>{feedback && <div className="text-sm"><p className={feedback.correct ? 'text-green-700 dark:text-green-300' : 'text-destructive'}>{feedback.correct ? 'Correct' : `Correct answer: ${feedback.correctAnswer}`}</p>{feedback.explanation && <p className="mt-1 text-muted-foreground">{feedback.explanation}</p>}</div>}</fieldset>;
        })}
        {!result && <Button type="submit" disabled={loading || quiz.questions.length === 0} className="gap-2">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{loading ? 'Submitting…' : 'Submit answers'}</Button>}
      </form>
    </div>
  );
}
