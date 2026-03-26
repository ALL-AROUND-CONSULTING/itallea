import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/apiClient";

export type DailyNutrition = {
  date: string;
  totals: { kcal: number; protein: number; carbs: number; fat: number };
  targets: { kcal: number; protein: number; carbs: number; fat: number };
  percentages: { kcal: number; protein: number; carbs: number; fat: number };
  mealTotals: Record<string, { kcal: number; protein: number; carbs: number; fat: number }>;
  meals: Record<string, Array<{ id?: string; name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number }>>;
};

export function useDailyNutrition(date?: string) {
  const { user } = useAuth();
  const dateStr = date || new Date().toISOString().split("T")[0];

  return useQuery<DailyNutrition>({
    queryKey: ["daily-nutrition", dateStr],
    enabled: !!user,
    queryFn: async () => {
      const data = await apiClient<any>("/api/app/meals/summary", {
        method: "POST",
        body: { start_date: dateStr, end_date: dateStr },
      });

      // The API returns an array of day summaries; pick the one for our date
      const days = Array.isArray(data) ? data : data.records ?? [data];
      const day = days.find((d: any) => d.date === dateStr) ?? days[0];

      if (!day) {
        return {
          date: dateStr,
          totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
          targets: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
          percentages: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
          mealTotals: {},
          meals: {},
        };
      }

      // Map meal keys from API (may be capitalized) to lowercase
      const mealKeyMap: Record<string, string> = {
        Breakfast: "breakfast",
        Lunch: "lunch",
        Dinner: "dinner",
        Snack: "snack",
        breakfast: "breakfast",
        lunch: "lunch",
        dinner: "dinner",
        snack: "snack",
      };

      const meals: DailyNutrition["meals"] = {};
      const mealTotals: DailyNutrition["mealTotals"] = {};
      const apiMeals = day.meals ?? {};

      for (const [key, items] of Object.entries(apiMeals)) {
        const normalizedKey = mealKeyMap[key] ?? key.toLowerCase();
        const mealItems = Array.isArray(items) ? items : [];
        meals[normalizedKey] = mealItems.map((item: any) => ({
          id: item.id,
          name: item.product_name ?? item.name,
          grams: Number(item.grams ?? 0),
          kcal: Number(item.kcal ?? 0),
          protein: Number(item.protein ?? 0),
          carbs: Number(item.carbs ?? 0),
          fat: Number(item.fat ?? 0),
        }));
        mealTotals[normalizedKey] = meals[normalizedKey].reduce(
          (acc, item) => ({
            kcal: acc.kcal + item.kcal,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fat: acc.fat + item.fat,
          }),
          { kcal: 0, protein: 0, carbs: 0, fat: 0 }
        );
      }

      const totals = Object.values(mealTotals).reduce(
        (acc, mt) => ({
          kcal: acc.kcal + mt.kcal,
          protein: acc.protein + mt.protein,
          carbs: acc.carbs + mt.carbs,
          fat: acc.fat + mt.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      );

      const targets = day.targets ?? { kcal: 0, protein: 0, carbs: 0, fat: 0 };
      const percentages = {
        kcal: targets.kcal ? Math.round((totals.kcal / targets.kcal) * 100) : 0,
        protein: targets.protein ? Math.round((totals.protein / targets.protein) * 100) : 0,
        carbs: targets.carbs ? Math.round((totals.carbs / targets.carbs) * 100) : 0,
        fat: targets.fat ? Math.round((totals.fat / targets.fat) * 100) : 0,
      };

      return { date: dateStr, totals, targets, percentages, mealTotals, meals };
    },
    staleTime: 30_000,
  });
}
