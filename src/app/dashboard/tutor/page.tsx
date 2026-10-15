import { TutorWorkspace } from '@/components/tutor/TutorWorkspace';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { searchParams: Promise<{ materialId?: string }> };

export default async function TutorPage({ searchParams }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const [{ materialId }, materials, conversations] = await Promise.all([
    searchParams,
    prisma.material.findMany({ where: { userId, status: 'completed' }, select: { id: true, title: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.tutorConversation.findMany({ where: { userId }, select: { id: true, title: true, materialId: true, updatedAt: true, material: { select: { title: true } } }, orderBy: { updatedAt: 'desc' }, take: 50 }),
  ]);
  return <TutorWorkspace initialMaterialId={materialId} materials={materials} conversations={conversations.map((conversation) => ({ id: conversation.id, title: conversation.title, materialTitle: conversation.material?.title ?? null, updatedAt: conversation.updatedAt.toISOString() }))} />;
}
