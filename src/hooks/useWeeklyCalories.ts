import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";

export type DayCalories = {
  date: string;
  label: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export function useWeeklyCalories() {
  const { user } = useAuth();

  return useQuery<DayCalories[]>({
    queryKey: ["weekly-calories"],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        dates.push(format(subDays(today, i), "yyyy-MM-dd"));
      }

      const data = await apiClient<any>("/api/app/meals/summary/", {
        method: "POST",
        body: { start_date: dates[0], end_date: dates[6] },
      });

      const days = Array.isArray(data) ? data : data.records ?? [];

      const byDay: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {};
      for (const d of dates) {
        byDay[d] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
      }

      for (const day of days) {
        const d = day.date;
        if (!byDay[d]) continue;
        const meals = day.meals ?? {};
        for (const items of Object.values(meals)) {
          for (const item of (items as any[])) {
            byDay[d].kcal += Number(item.kcal ?? 0);
            byDay[d].protein += Number(item.protein ?? 0);
            byDay[d].carbs += Number(item.carbs ?? 0);
            byDay[d].fat += Number(item.fat ?? 0);
          }
        }
      }

      return dates.map((d) => ({
        date: d,
        label: format(new Date(d + "T00:00:00"), "EEE"),
        kcal: Math.round(byDay[d].kcal),
        protein: Math.round(byDay[d].protein),
        carbs: Math.round(byDay[d].carbs),
        fat: Math.round(byDay[d].fat),
      }));
    },
    staleTime: 60_000,
  });
}
