/**
 * Centralized HTTP client for the custom REST backend.
 * - Auto-injects Authorization: Bearer <access_token>
 * - Intercepts 401 → attempts token refresh → retries original request once
 */

const API_BASE_URL = "https://italea.test.b4web.biz";

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

// ── Refresh logic (singleton promise to avoid concurrent refreshes) ──

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh,
      }),
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

type ApiOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

export async function apiClient<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: extraHeaders = {}, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (!skipAuth) {
    await ensureFreshToken();
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  let res = await fetch(url, { ...fetchOpts, headers });

  // If 401, try refresh once and retry
  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...fetchOpts, headers });
    } else {
      // Force logout — dispatch a custom event so AuthContext can react
      window.dispatchEvent(new Event("auth:logout"));
      throw new Error("Unauthenticated");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `HTTP ${res.status}`);
  }

  return res.json();
}
