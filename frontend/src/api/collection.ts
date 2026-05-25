import { apiRequest } from '../lib/api';
import type { CollectionEntry, CollectionStats } from '../types';

interface CollectionPayload {
  data: { entries: CollectionEntry[] };
}

interface StatsPayload {
  data: { stats: CollectionStats };
}

interface EntryPayload {
  data: { entry: CollectionEntry };
}

export async function fetchMyCollection(token: string) {
  return apiRequest<CollectionPayload>('/collection', { token });
}

export async function fetchCollectionStats(token: string) {
  return apiRequest<StatsPayload>('/collection/stats', { token });
}

export async function upsertCollectionEntry(
  token: string,
  itemId: string,
  body: { acquired?: boolean; quantity?: number; notes?: string | null }
) {
  return apiRequest<EntryPayload>(`/collection/${itemId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}
