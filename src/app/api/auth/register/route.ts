import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const registrationSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters.').refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    'Password must not exceed 72 UTF-8 bytes.',
  ),
  name: z.string().trim().min(1, 'Name is required.').max(100, 'Name must be 100 characters or fewer.'),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? 'Please check your registration details.' },
      { status: 400 },
    );
  }

  const { email, password, name } = parsed.data;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }
    const hashed = await hash(password, 12);
    await prisma.user.create({
      data: { email, password: hashed, name },
    });
    return NextResponse.json({ message: 'User created' }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      const safeMessage = process.env.DATABASE_URL
        ? error.message.replaceAll(process.env.DATABASE_URL, '[DATABASE_URL]')
        : error.message;
      console.error('Registration database connection failed.', {
        errorName: error.name,
        errorCode: error.errorCode ?? 'unknown',
        clientVersion: error.clientVersion,
        message: safeMessage,
      });
      return NextResponse.json(
        { message: 'Account registration is unavailable because the database cannot be reached.' },
        { status: 503 },
      );
    }

    console.error('Registration failed.', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
      prismaCode: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
    });
    return NextResponse.json({ message: 'We could not create your account. Please try again later.' }, { status: 500 });
  }
}
