import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";
import { it } from "date-fns/locale";
import type { RangeKey } from "./useRangeNutrition";

export type DayWater = {
  date: string;
  label: string;
  ml: number;
};

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
};

export function useWaterHistory(range: RangeKey) {
  const { user } = useAuth();
  const days = RANGE_DAYS[range];

  return useQuery<DayWater[]>({
    queryKey: ["water-history", range],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        dates.push(format(subDays(today, i), "yyyy-MM-dd"));
      }

      const { data, error } = await supabase
        .from("water_logs")
        .select("logged_at, amount_ml")
        .eq("user_id", user!.id)
        .gte("logged_at", dates[0])
        .lte("logged_at", dates[dates.length - 1]);

      if (error) throw error;

      const byDay: Record<string, number> = {};
      for (const d of dates) {
        byDay[d] = 0;
      }
      for (const row of data ?? []) {
        const d = row.logged_at;
        if (byDay[d] !== undefined) {
          byDay[d] += row.amount_ml;
        }
      }

      const labelFmt = days <= 7 ? "EEE" : days <= 30 ? "d MMM" : "d/M";

      return dates.map((d) => ({
        date: d,
        label: format(new Date(d + "T00:00:00"), labelFmt, { locale: it }),
        ml: byDay[d],
      }));
    },
    staleTime: 60_000,
  });
}
