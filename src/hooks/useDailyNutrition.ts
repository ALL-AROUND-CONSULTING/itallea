import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DailyNutrition = {
  date: string;
  totals: { kcal: number; protein: number; carbs: number; fat: number };
  targets: { kcal: number; protein: number; carbs: number; fat: number };
  percentages: { kcal: number; protein: number; carbs: number; fat: number };
  mealTotals: Record<string, { kcal: number; protein: number; carbs: number; fat: number }>;
  meals: Record<string, Array<{ name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number }>>;
};

export function useDailyNutrition(date?: string) {
  const { user } = useAuth();
  const dateStr = date || new Date().toISOString().split("T")[0];

  return useQuery<DailyNutrition>({
    queryKey: ["daily-nutrition", dateStr],
    enabled: !!user,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-daily-nutrition?date=${dateStr}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch nutrition data");
      return response.json();
    },
    staleTime: 30_000,
  });
}
