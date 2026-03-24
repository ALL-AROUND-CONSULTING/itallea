/**
 * Centralized HTTP client for the custom REST backend.
 * - Routes all calls through the Supabase edge-function proxy to avoid CORS
 * - Auto-injects Authorization: Bearer <access_token>
 * - Intercepts 401 → attempts token refresh → retries original request once
 */

const PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/backend-proxy`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const TOKEN_KEY = "italea_access_token";
const REFRESH_KEY = "italea_refresh_token";
const EXPIRES_KEY = "italea_token_expires_at";

// ── Token helpers ──────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string, expiresIn: number) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function isTokenExpired(): boolean {
  const exp = localStorage.getItem(EXPIRES_KEY);
  if (!exp) return true;
  return Date.now() >= Number(exp);
}

// ── Low-level proxy call ───────────────────────────────────────

async function proxyFetch(
  path: string,
  method: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  return fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      path,
      method,
      body,
      headers: extraHeaders,
    }),
  });
}

// ── Refresh logic (singleton promise to avoid concurrent refreshes) ──

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await proxyFetch("/oauth/token/", "POST", {
      grant_type: "refresh_token",
      client_id: "019cf6e9-eb89-7231-8c1e-fd4c46d7ff07",
      client_secret: "L2EtxKyDGiOmrVVqWytsblhNbdVlUm4muJWoDxKQ",
      refresh_token: refresh,
      scope: "*",
    });

    if (!res.ok) {
      clearTokens();
      return false;
    }

    const data = await res.json();
    setTokens(data.access_token, data.refresh_token, data.expires_in);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function ensureFreshToken(): Promise<boolean> {
  if (!isTokenExpired()) return true;
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ── Main fetch wrapper ─────────────────────────────────────────

type ApiOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

export async function apiClient<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: extraHeaders = {}, method = "GET", body } = options;

  const upstreamHeaders: Record<string, string> = {
    ...extraHeaders,
  };

  if (!skipAuth) {
    await ensureFreshToken();
    const token = getAccessToken();
    if (token) {
      upstreamHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  let res = await proxyFetch(path, method, body, upstreamHeaders);

  // If 401, try refresh once and retry
  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      upstreamHeaders["Authorization"] = `Bearer ${getAccessToken()}`;
      res = await proxyFetch(path, method, body, upstreamHeaders);
    } else {
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Unauthenticated");
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || errBody.error || `HTTP ${res.status}`);
  }

  return res.json();
}
