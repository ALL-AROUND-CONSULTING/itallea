/**
 * Auth service — handles login / logout / token persistence
 * against the software house's OAuth2 endpoint.
 */

import { setTokens, clearTokens, getAccessToken } from "./apiClient";

const API_BASE_URL = "https://italea.test.b4web.biz";

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        ok: false,
        error: data.error_description || data.error || "Credenziali non valide",
      };
    }

    setTokens(data.access_token, data.refresh_token, data.expires_in);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Errore di rete" };
  }
}

export function logout() {
  clearTokens();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
