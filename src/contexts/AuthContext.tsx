import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as authLogin, logout as authLogout, isAuthenticated } from "@/lib/authService";
import { apiClient, getAccessToken } from "@/lib/apiClient";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
  theme: string;
  water_goal_ml: number;
  avatar_url: string | null;
  target_kcal: number | null;
  target_protein: number | null;
  target_carbs: number | null;
  target_fat: number | null;
  target_weight: number | null;
};

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ ok: false }),
  signOut: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiClient<any>("/api/app/vw_profiles/get/", {
        method: "POST",
        body: {},
      });
      // The API may return the profile directly or inside a wrapper
      const p = data.record ?? data;
      setProfile({
        id: p.id ?? "user",
        first_name: p.first_name ?? null,
        last_name: p.last_name ?? null,
        onboarding_completed: p.onboarding_completed ?? true,
        theme: p.theme ?? "light",
        water_goal_ml: p.water_goal_ml ?? 2000,
        avatar_url: p.avatar_url ?? null,
        target_kcal: p.target_kcal ?? null,
        target_protein: p.target_protein ?? null,
        target_carbs: p.target_carbs ?? null,
        target_fat: p.target_fat ?? null,
        target_weight: p.target_weight ?? null,
      });
      if (p.id) {
        setUser((prev) => prev ?? { id: p.id, email: "" });
      }
    } catch {
      // profile endpoint not available yet — use stub
      setProfile({
        id: "demo",
        first_name: "Demo",
        last_name: "User",
        onboarding_completed: true,
        theme: "light",
        water_goal_ml: 2000,
        avatar_url: null,
        target_kcal: null,
        target_protein: null,
        target_carbs: null,
        target_fat: null,
        target_weight: null,
      });
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isAuthenticated()) await fetchProfile();
  }, [fetchProfile]);

  // Boot: check for existing token
  useEffect(() => {
    if (isAuthenticated()) {
      setUser({ id: "demo", email: "" });
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Listen for forced logout (401 after failed refresh)
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setProfile(null);
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await authLogin(email, password);
      if (result.ok) {
        setUser({ id: "demo", email });
        await fetchProfile();
      }
      return result;
    },
    [fetchProfile]
  );

  const signOut = useCallback(async () => {
    await authLogout();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
