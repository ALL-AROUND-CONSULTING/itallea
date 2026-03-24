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
    }>("/oauth/token", {
      method: "POST",
      body: {
        grant_type: "password",
        client_id: "019cf6e9-eb89-7231-8c1e-fd4c46d7ff07",
        client_secret: "L2EtxKyDGiOmrVVqWytsblhNbdVlUm4muJWoDxKQ",
        username,
        password,
        scope: "*",
      },
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

export async function logout() {
  try {
    await apiClient("/api/logout/", { method: "POST" });
  } catch {
    // ignore — clear tokens regardless
  }
  clearTokens();
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
