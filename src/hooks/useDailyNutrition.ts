import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

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
      return apiClient<DailyNutrition>(`/api/get-daily-nutrition/?date=${dateStr}`);
    },
    staleTime: 30_000,
  });
}
