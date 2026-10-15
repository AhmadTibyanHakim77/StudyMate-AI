import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

const profileSchema = z.object({ name: z.string().trim().min(1).max(100) });

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to update your profile.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 }); }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: 'Name must be between 1 and 100 characters.' }, { status: 400 });
  const user = await prisma.user.update({ where: { id: userId }, data: { name: parsed.data.name }, select: { id: true, name: true, email: true } });
  return NextResponse.json({ user });
}
