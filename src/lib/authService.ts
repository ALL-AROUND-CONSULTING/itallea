/**
 * Auth service — handles login / logout / token persistence
 * against the software house's OAuth2 endpoint via the proxy.
 */

import { setTokens, clearTokens, getAccessToken, apiClient } from "./apiClient";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const data = await apiClient<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      error?: string;
      error_description?: string;
    }>("/oauth/token/", {
      method: "POST",
      body: { username, password },
      skipAuth: true,
    });

    if (data.error) {
      return { ok: false, error: data.error_description || data.error || "Credenziali non valide" };
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
