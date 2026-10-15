import { notFound } from 'next/navigation';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

export default async function SettingsPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  if (!user?.email) notFound();
  return <ProfileSettings initialName={user.name ?? ''} email={user.email} />;
}
