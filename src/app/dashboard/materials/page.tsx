import { MaterialLibrary } from '@/components/materials/MaterialLibrary';
import { getAuthenticatedUserId } from '@/lib/server/auth';
import prisma from '@/lib/prisma';

export default async function MaterialsPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return null;

  const [materials, configuredLimit] = await Promise.all([
    prisma.material.findMany({
      where: { userId },
      select: { id: true, title: true, fileName: true, fileSize: true, status: true, pageCount: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    Promise.resolve(Number(process.env.MAX_FILE_SIZE_MB)),
  ]);
  const maxFileSizeMb = Number.isFinite(configuredLimit) && configuredLimit > 0 ? Math.min(configuredLimit, 25) : 10;

  return <MaterialLibrary initialMaterials={materials.map((material) => ({ ...material, createdAt: material.createdAt.toISOString() }))} maxFileSizeMb={maxFileSizeMb} />;
}
