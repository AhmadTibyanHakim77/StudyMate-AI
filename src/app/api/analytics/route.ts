import { NextResponse } from 'next/server';
import { getUserAnalytics } from '@/lib/analytics';
import { getAuthenticatedUserId } from '@/lib/server/auth';

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ message: 'Sign in to view study analytics.' }, { status: 401 });
  return NextResponse.json({ analytics: await getUserAnalytics(userId) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
