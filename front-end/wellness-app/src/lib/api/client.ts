import { config } from '@/lib/config';
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from './types';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) {
    return data.session.access_token;
  }
  const { data: refreshed } = await supabase.auth.refreshSession();
  return refreshed.session?.access_token ?? null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  // If the app is making a protected API call but there's no session token,
  // throw early to avoid noisy 401s from the backend and surface a clearer error.
  const protectedPrefixes = ['/api/v1', '/streaks', '/badges', '/challenges', '/leaderboards', '/health', '/analytics'];
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));
  if (!token && isProtected) {
    throw new ApiError(401, 'Not authenticated');
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${config.apiUrl}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const errBody = await res.json();
      detail = errBody.detail ?? errBody.message ?? detail;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, String(detail));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body ?? {}),
  });
}

export async function apiDelete(path: string): Promise<void> {
  return apiFetch<void>(path, { method: 'DELETE' });
}

export async function unwrap<T>(response: ApiResponse<T>): Promise<T> {
  return response.data;
}
