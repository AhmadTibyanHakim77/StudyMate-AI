import { QuizCenter } from '@/components/quizzes/QuizCenter';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { searchParams: Promise<{ materialId?: string }> };

export default async function QuizzesPage({ searchParams }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const [{ materialId }, materials, quizzes] = await Promise.all([
    searchParams,
    prisma.material.findMany({ where: { userId, status: 'completed' }, select: { id: true, title: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.quiz.findMany({ where: { userId }, select: { id: true, title: true, materialId: true, createdAt: true, material: { select: { title: true } }, _count: { select: { questions: true, attempts: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  return <QuizCenter initialMaterialId={materialId} materials={materials} quizzes={quizzes.map((quiz) => ({ id: quiz.id, title: quiz.title, materialId: quiz.materialId, materialTitle: quiz.material.title, createdAt: quiz.createdAt.toISOString(), questionCount: quiz._count.questions, attemptCount: quiz._count.attempts }))} />;
}
