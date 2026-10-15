import Link from "next/link";
import { ArrowRight, Brain, FileText, MessageSquare, Plus, Sparkles } from "lucide-react";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/server/auth";

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const [user, materialCount, quizCount, attempts, recentMaterials, recentAttempts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.material.count({ where: { userId } }),
    prisma.quiz.count({ where: { userId } }),
    prisma.quizAttempt.aggregate({ where: { userId }, _avg: { score: true }, _count: { _all: true } }),
    prisma.material.findMany({ where: { userId }, select: { id: true, title: true, fileName: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.quizAttempt.findMany({ where: { userId }, select: { id: true, score: true, createdAt: true, quiz: { select: { id: true, title: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);
  const averageScore = attempts._avg.score;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-primary">YOUR STUDY SPACE</p><h1 className="mt-1 text-3xl font-semibold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1><p className="mt-2 text-sm text-muted-foreground">Pick up where you left off or add new material.</p></div>
        <Link href="/dashboard/materials"><span className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" />Upload material</span></Link>
      </header>

      <section aria-label="Study statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Materials', value: materialCount, icon: FileText },
          { label: 'Quizzes created', value: quizCount, icon: Brain },
          { label: 'Quiz attempts', value: attempts._count._all, icon: Sparkles },
          { label: 'Average score', value: averageScore === null ? '—' : `${Math.round(averageScore)}%`, icon: MessageSquare },
        ].map(({ label, value, icon: Icon }) => <div key={label} className="border border-border bg-card p-4"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4" /></div><p className="mt-3 text-2xl font-semibold">{value}</p></div>)}
      </section>

      <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { href: '/dashboard/materials', label: 'Upload PDF', detail: 'Add a study document', icon: FileText },
          { href: '/dashboard/summaries', label: 'Generate summary', detail: 'Review key ideas', icon: Sparkles },
          { href: '/dashboard/quizzes', label: 'Create a quiz', detail: 'Check your understanding', icon: Brain },
          { href: '/dashboard/tutor', label: 'Ask AI Tutor', detail: 'Explore your materials', icon: MessageSquare },
        ].map(({ href, label, detail, icon: Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 border border-border p-4 hover:border-primary/50"><Icon className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block font-medium">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{detail}</span></span><ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-3"><h2 className="font-semibold">Recent materials</h2><Link href="/dashboard/materials" className="text-sm text-primary hover:underline">View all</Link></div>
          {recentMaterials.length ? <ul className="divide-y divide-border">{recentMaterials.map((material) => <li key={material.id} className="flex items-center gap-3 py-3"><FileText className="h-4 w-4 shrink-0 text-primary" /><Link href={`/dashboard/materials/${material.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary">{material.title}</Link><span className="text-xs capitalize text-muted-foreground">{material.status}</span></li>)}</ul> : <div className="border-b border-border py-8 text-center"><p className="text-sm text-muted-foreground">No materials yet.</p><Link href="/dashboard/materials" className="mt-2 inline-block text-sm text-primary hover:underline">Upload your first PDF</Link></div>}
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-border pb-3"><h2 className="font-semibold">Recent quiz activity</h2><Link href="/dashboard/quizzes" className="text-sm text-primary hover:underline">Quiz center</Link></div>
          {recentAttempts.length ? <ul className="divide-y divide-border">{recentAttempts.map((attempt) => <li key={attempt.id} className="flex items-center gap-3 py-3"><Brain className="h-4 w-4 shrink-0 text-secondary" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{attempt.quiz.title}</span><span className="text-sm tabular-nums">{attempt.score}%</span></li>)}</ul> : <div className="border-b border-border py-8 text-center"><p className="text-sm text-muted-foreground">Quiz scores will appear here after your first attempt.</p><Link href="/dashboard/quizzes" className="mt-2 inline-block text-sm text-primary hover:underline">Create a quiz</Link></div>}
        </div>
      </section>
    </div>
  );
}
