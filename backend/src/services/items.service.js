import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listItems({ category, search, limit = 50, offset = 0 } = {}) {
  const where = {};

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { name: 'asc' },
      take: Math.min(limit, 100),
      skip: offset,
    }),
    prisma.item.count({ where }),
  ]);

  return { items, total, limit, offset };
}

export async function getItemById(id) {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  return item;
}
