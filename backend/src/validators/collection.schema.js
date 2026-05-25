import { z } from 'zod';

export const upsertCollectionSchema = z.object({
  params: z.object({
    itemId: z.string().cuid(),
  }),
  body: z.object({
    acquired: z.boolean().optional(),
    quantity: z.number().int().min(0).max(9999).optional(),
    notes: z.string().max(500).optional().nullable(),
  }),
});
