import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getUserCollection(userId) {
  const entries = await prisma.collectionEntry.findMany({
    where: { userId },
    include: { item: true },
    orderBy: { updatedAt: 'desc' },
  });

  return entries;
}

export async function getCollectionStats(userId) {
  const [acquired, totalItems, entries] = await Promise.all([
    prisma.collectionEntry.count({
      where: { userId, acquired: true },
    }),
    prisma.item.count(),
    prisma.collectionEntry.count({ where: { userId } }),
  ]);

  return {
    acquired,
    tracked: entries,
    catalogTotal: totalItems,
    completionPercent: totalItems > 0 ? Math.round((acquired / totalItems) * 100) : 0,
  };
}

export async function upsertCollectionEntry(userId, itemId, data) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  const acquired = data.acquired ?? false;
  const acquiredAt = acquired ? new Date() : null;

  const entry = await prisma.collectionEntry.upsert({
    where: {
      userId_itemId: { userId, itemId },
    },
    create: {
      userId,
      itemId,
      acquired,
      quantity: data.quantity ?? 1,
      notes: data.notes ?? null,
      acquiredAt,
    },
    update: {
      ...(data.acquired !== undefined && { acquired, acquiredAt }),
      ...(data.quantity !== undefined && { quantity: data.quantity }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: { item: true },
  });

  return entry;
}
