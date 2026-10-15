import { z } from 'zod';
import { notFound } from 'next/navigation';
import { TutorWorkspace } from '@/components/tutor/TutorWorkspace';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { params: Promise<{ conversationId: string }> };
const sourceSchema = z.array(z.object({ materialId: z.string(), title: z.string(), chunkIndex: z.number().int().nonnegative() }));

export default async function TutorConversationPage({ params }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const { conversationId } = await params;
  const [conversation, materials, conversations] = await Promise.all([
    prisma.tutorConversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true, title: true, materialId: true, material: { select: { title: true } }, messages: { select: { id: true, role: true, content: true, sources: true, createdAt: true }, orderBy: { createdAt: 'asc' } } },
    }),
    prisma.material.findMany({ where: { userId, status: 'completed' }, select: { id: true, title: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.tutorConversation.findMany({ where: { userId }, select: { id: true, title: true, updatedAt: true, material: { select: { title: true } } }, orderBy: { updatedAt: 'desc' }, take: 50 }),
  ]);
  if (!conversation) notFound();

  return <TutorWorkspace
    initialMaterialId={conversation.materialId ?? undefined}
    materials={materials}
    conversations={conversations.map((item) => ({ id: item.id, title: item.title, materialTitle: item.material?.title ?? null, updatedAt: item.updatedAt.toISOString() }))}
    activeConversation={{
      id: conversation.id,
      title: conversation.title,
      materialTitle: conversation.material?.title ?? null,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        sources: sourceSchema.safeParse(message.sources).success ? sourceSchema.parse(message.sources) : [],
        createdAt: message.createdAt.toISOString(),
      })),
    }}
  />;
}
