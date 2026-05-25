import type { ApiError } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = body as ApiError;
    throw new ApiClientError(
      err.error?.message ?? 'Request failed',
      response.status,
      err.error?.details
    );
  }

  return body as T;
}
