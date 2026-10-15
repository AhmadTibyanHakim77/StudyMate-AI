import prisma from '@/lib/prisma';

export async function getUserAnalytics(userId: string) {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - 13);

  const [materialCount, quizCount, attemptAggregate, recentAttempts, activityAttempts] = await Promise.all([
    prisma.material.count({ where: { userId } }),
    prisma.quiz.count({ where: { userId } }),
    prisma.quizAttempt.aggregate({ where: { userId }, _count: { _all: true }, _avg: { score: true } }),
    prisma.quizAttempt.findMany({ where: { userId }, select: { id: true, score: true, createdAt: true, quiz: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.quizAttempt.findMany({ where: { userId, createdAt: { gte: startDate } }, select: { createdAt: true, score: true }, orderBy: { createdAt: 'asc' } }),
  ]);

  const dayCounts = new Map<string, number>();
  const dayScores = new Map<string, number[]>();
  for (const attempt of activityAttempts) {
    const day = attempt.createdAt.toISOString().slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    dayScores.set(day, [...(dayScores.get(day) ?? []), attempt.score]);
  }
  const activity = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, attempts: dayCounts.get(key) ?? 0, averageScore: dayScores.get(key)?.reduce((total, score, _, scores) => total + score / scores.length, 0) ?? null };
  });

  return {
    materialCount,
    quizCount,
    attemptCount: attemptAggregate._count._all,
    averageScore: attemptAggregate._avg.score,
    activity,
    recentAttempts: recentAttempts.map((attempt) => ({ id: attempt.id, title: attempt.quiz.title, score: attempt.score, createdAt: attempt.createdAt.toISOString() })),
  };
}
