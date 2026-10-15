import { getUserAnalytics } from '@/lib/analytics';
import { getAuthenticatedUserId } from '@/lib/server/auth';

export default async function AnalyticsPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const analytics = await getUserAnalytics(userId);
  const maxAttempts = Math.max(1, ...analytics.activity.map((day) => day.attempts));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header><p className="text-sm font-medium text-primary">YOUR LEARNING DATA</p><h1 className="mt-1 text-3xl font-semibold">Study Analytics</h1><p className="mt-2 text-sm text-muted-foreground">A view of activity recorded in your account.</p></header>
      <section aria-label="Study statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['Materials', analytics.materialCount], ['Quizzes', analytics.quizCount], ['Attempts', analytics.attemptCount], ['Average score', analytics.averageScore === null ? '—' : `${Math.round(analytics.averageScore)}%`]].map(([label, value]) => <div key={String(label)} className="border border-border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></div>)}
      </section>
      <section className="border-y border-border py-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><div><h2 className="font-semibold">Quiz activity</h2><p className="mt-1 text-sm text-muted-foreground">Attempts recorded per day over the last 14 days.</p></div><span className="text-xs text-muted-foreground">UTC</span></div>
        {analytics.attemptCount === 0 ? <p className="mt-5 text-sm text-muted-foreground">Complete a quiz to start tracking activity.</p> : <div role="img" aria-label="Bar chart showing quiz attempts per day for the last 14 days" className="mt-5 grid h-36 grid-cols-7 gap-2 sm:grid-cols-14">{analytics.activity.map((day) => <div key={day.date} title={`${day.date}: ${day.attempts} attempts`} className="flex min-w-0 flex-col items-center justify-end gap-2"><div className="flex h-24 w-full items-end border-b border-border"><div className="w-full bg-primary/80" style={{ height: `${day.attempts ? Math.max(8, day.attempts / maxAttempts * 100) : 0}%` }} /></div><time className="text-[10px] text-muted-foreground">{day.date.slice(5)}</time></div>)}</div>}
      </section>
      <section><h2 className="font-semibold">Recent quiz results</h2>{analytics.recentAttempts.length ? <ul className="mt-3 divide-y divide-border border-y border-border">{analytics.recentAttempts.map((attempt) => <li key={attempt.id} className="flex flex-wrap items-center gap-3 py-3"><span className="min-w-0 flex-1 truncate text-sm font-medium">{attempt.title}</span><time className="text-xs text-muted-foreground">{new Date(attempt.createdAt).toLocaleDateString()}</time><span className="tabular-nums text-sm font-semibold">{attempt.score}%</span></li>)}</ul> : <p className="mt-3 border-y border-border py-5 text-sm text-muted-foreground">No quiz attempts have been recorded yet.</p>}</section>
    </div>
  );
}
