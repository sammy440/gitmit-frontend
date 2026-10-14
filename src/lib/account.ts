"use client";

import { API_URL } from "./site";

/** Gitmit accounts in the browser: the session lives in localStorage; saved keys never come back. */

const STORAGE_KEY = "gitmit.session";

export type KeyProvider = "openai" | "anthropic";

export interface Account {
  user: { login: string; name: string | null; avatarUrl: string | null };
  keys: { provider: KeyProvider; last4: string; model: string | null; updatedAt: string }[];
  sessions: { id: string; client: "web" | "cli" | "vscode"; label: string | null; createdAt: string; lastUsedAt: string | null; current: boolean }[];
}

export class AccountError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage unavailable (private mode); the user will need to sign in again.
  }
  window.dispatchEvent(new Event("gitmit-session"));
}

export function clearToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
  window.dispatchEvent(new Event("gitmit-session"));
}

/** Where the "Sign in with GitHub" button goes. The API redirects back to /account/callback. */
export function signInUrl(returnTo = "/account"): string {
  return `${API_URL}/api/auth/github/start?return=${encodeURIComponent(returnTo)}`;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new AccountError("Not signed in.", 401);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "content-type": "application/json", authorization: `Bearer ${token}`, ...(init.headers as Record<string, string>) },
    });
  } catch {
    throw new AccountError("Could not reach the gitmit API. Check your connection.", 0);
  }
  const body = (await response.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
  if (response.status === 401) {
    clearToken();
    throw new AccountError("Your sign-in has expired. Sign in again.", 401);
  }
  if (!response.ok) throw new AccountError(body?.error?.message ?? `Request failed (HTTP ${response.status}).`, response.status);
  return body as T;
}

export const accountApi = {
  me: () => call<Account>("/api/me"),
  saveKey: (provider: KeyProvider, key: string, model: string | null) =>
    call<Account["keys"][number]>(`/api/keys/${provider}`, { method: "PUT", body: JSON.stringify({ key, model }) }),
  deleteKey: (provider: KeyProvider) => call(`/api/keys/${provider}`, { method: "DELETE" }),
  revokeSession: (id: string) => call(`/api/sessions/${id}`, { method: "DELETE" }),
  logout: () => call("/api/auth/logout", { method: "POST" }),
  deleteAccount: () => call("/api/me", { method: "DELETE" }),
};
