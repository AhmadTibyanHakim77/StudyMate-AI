import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import { QuizRunner } from '@/components/quizzes/QuizRunner';

type PageProps = { params: Promise<{ quizId: string }> };

export default async function QuizPage({ params }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true, title: true, material: { select: { title: true } }, questions: { select: { id: true, prompt: true, options: true } } },
  });
  if (!quiz) notFound();
  return <QuizRunner quiz={{ ...quiz, materialTitle: quiz.material.title }} />;
}
