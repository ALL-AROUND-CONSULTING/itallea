import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";

export type DayNutrition = {
  date: string;
  label: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type RangeKey = "7d" | "30d" | "90d" | "180d";

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
};

export function useRangeNutrition(range: RangeKey) {
  const { user } = useAuth();
  const days = RANGE_DAYS[range];

  return useQuery<DayNutrition[]>({
    queryKey: ["range-nutrition", range],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        dates.push(format(subDays(today, i), "yyyy-MM-dd"));
      }

      const { data, error } = await supabase
        .from("weighings")
        .select("logged_at, kcal, protein, carbs, fat")
        .eq("user_id", user!.id)
        .gte("logged_at", dates[0])
        .lte("logged_at", dates[dates.length - 1]);

      if (error) throw error;

      const byDay: Record<string, { kcal: number; protein: number; carbs: number; fat: number }> = {};
      for (const d of dates) {
        byDay[d] = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
      }
      for (const row of data ?? []) {
        const d = row.logged_at;
        if (byDay[d]) {
          byDay[d].kcal += Number(row.kcal);
          byDay[d].protein += Number(row.protein);
          byDay[d].carbs += Number(row.carbs);
          byDay[d].fat += Number(row.fat);
        }
      }

      const labelFmt = days <= 7 ? "EEE" : days <= 30 ? "d MMM" : "d/M";

      return dates.map((d) => ({
        date: d,
        label: format(new Date(d + "T00:00:00"), labelFmt, { locale: it }),
        kcal: Math.round(byDay[d].kcal),
        protein: Math.round(byDay[d].protein),
        carbs: Math.round(byDay[d].carbs),
        fat: Math.round(byDay[d].fat),
      }));
    },
    staleTime: 60_000,
  });
}
