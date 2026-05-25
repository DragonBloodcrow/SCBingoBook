import { apiRequest } from '../lib/api';
import type { Item } from '../types';

interface ItemsListPayload {
  data: {
    items: Item[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface ItemPayload {
  data: { item: Item };
}

export async function fetchItems(params?: { category?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiRequest<ItemsListPayload>(`/items${qs ? `?${qs}` : ''}`);
}

export async function fetchItem(id: string) {
  return apiRequest<ItemPayload>(`/items/${id}`);
}
