export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  createdAt: string;
}

export interface Item {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionEntry {
  id: string;
  userId: string;
  itemId: string;
  acquired: boolean;
  quantity: number;
  notes: string | null;
  acquiredAt: string | null;
  item: Item;
}

export interface CollectionStats {
  acquired: number;
  tracked: number;
  catalogTotal: number;
  completionPercent: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code?: string;
    retryAfterSeconds?: number;
    details?: unknown;
  };
}
