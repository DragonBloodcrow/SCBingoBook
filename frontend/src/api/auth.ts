import { apiRequest } from '../lib/api';
import type { AuthResponse, User } from '../types';

interface AuthPayload {
  data: AuthResponse;
}

interface MePayload {
  data: { user: User };
}

export async function register(input: {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}) {
  return apiRequest<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function login(input: { email: string; password: string }) {
  return apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchMe(token: string) {
  return apiRequest<MePayload>('/auth/me', { token });
}
