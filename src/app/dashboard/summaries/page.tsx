import { SummaryCenter } from '@/components/summaries/SummaryCenter';
import prisma from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/server/auth';

type PageProps = { searchParams: Promise<{ materialId?: string }> };

export default async function SummariesPage({ searchParams }: PageProps) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;
  const [{ materialId }, materials, summaries] = await Promise.all([
    searchParams,
    prisma.material.findMany({ where: { userId, status: 'completed' }, select: { id: true, title: true }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.summary.findMany({ where: { userId }, select: { id: true, title: true, materialId: true, createdAt: true, material: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  return <SummaryCenter initialMaterialId={materialId} materials={materials} summaries={summaries.map((summary) => ({ ...summary, materialTitle: summary.material.title, createdAt: summary.createdAt.toISOString() }))} />;
}
