import type { ApiErrorBody } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    options?: { code?: string; retryAfterSeconds?: number; details?: unknown }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = options?.code;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.details = options?.details;
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
    const err = body as ApiErrorBody;
    throw new ApiClientError(err.error?.message ?? 'Request failed', response.status, {
      code: err.error?.code,
      retryAfterSeconds: err.error?.retryAfterSeconds,
      details: err.error?.details,
    });
  }

  return body as T;
}
