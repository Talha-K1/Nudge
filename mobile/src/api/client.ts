
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080'
).replace(/\/+$/, '');

export const USE_MOCK =
  process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const TOKEN_KEY = 'nudge_token';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (
  fn: () => void
) => {
  onUnauthorized = fn;
};

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);

  const headers = new Headers(options.headers);

  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    onUnauthorized?.();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
