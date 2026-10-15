import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type RouteContext = { params: Promise<{ quizId: string }> };
const answersSchema = z.object({ answers: z.record(z.string().cuid(), z.number().int().min(0).max(3)) });

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to view quiz history.' }, { status: 401 });
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, userId }, select: { id: true } });
  if (!quiz) return NextResponse.json({ message: 'Quiz not found.' }, { status: 404 });
  const attempts = await prisma.quizAttempt.findMany({ where: { quizId, userId }, select: { id: true, score: true, createdAt: true, _count: { select: { answers: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  return NextResponse.json({ attempts });
}

export async function POST(request: Request, { params }: RouteContext) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to submit quiz answers.' }, { status: 401 });
  const { quizId } = await params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 }); }
  const parsed = answersSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Submit one selected option for each question.' }, { status: 400 });

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, userId },
    select: { id: true, questions: { select: { id: true, options: true, answer: true, explanation: true } } },
  });
  if (!quiz) return NextResponse.json({ message: 'Quiz not found.' }, { status: 404 });
  const submitted = parsed.data.answers;
  if (quiz.questions.length === 0 || Object.keys(submitted).length !== quiz.questions.length || quiz.questions.some((question) => submitted[question.id] === undefined || submitted[question.id] >= question.options.length)) {
    return NextResponse.json({ message: 'Answer every question using one of its available options.' }, { status: 400 });
  }

  const answers = quiz.questions.map((question) => {
    const selected = question.options[submitted[question.id]];
    return { questionId: question.id, selected, correct: selected === question.answer };
  });
  const correctCount = answers.filter((answer) => answer.correct).length;
  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const attempt = await prisma.quizAttempt.create({
    data: { quizId, userId, score, answers: { create: answers } },
    select: { id: true, score: true, createdAt: true },
  });

  return NextResponse.json({
    attempt: {
      ...attempt,
      correctCount,
      totalQuestions: quiz.questions.length,
      answers: quiz.questions.map((question) => ({
        questionId: question.id,
        selected: question.options[submitted[question.id]],
        correctAnswer: question.answer,
        correct: question.options[submitted[question.id]] === question.answer,
        explanation: question.explanation,
      })),
    },
  }, { status: 201 });
}
