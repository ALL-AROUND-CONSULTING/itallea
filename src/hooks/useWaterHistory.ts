import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
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
      const startDate = format(subDays(today, days - 1), "yyyy-MM-dd");
      const endDate = format(today, "yyyy-MM-dd");

      const data = await apiClient<any>("/api/app/water_logs/summary", {
        method: "POST",
        body: { start_date: startDate, end_date: endDate },
      });

      const records = Array.isArray(data) ? data : data.records ?? [];
      const byDay: Record<string, number> = {};
      for (const r of records) {
        byDay[r.date] = r.total_ml ?? r.value ?? 0;
      }

      const dates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        dates.push(format(subDays(today, i), "yyyy-MM-dd"));
      }

      const labelFmt = days <= 7 ? "EEE" : days <= 30 ? "d MMM" : "d/M";

      return dates.map((d) => ({
        date: d,
        label: format(new Date(d + "T00:00:00"), labelFmt, { locale: it }),
        ml: byDay[d] ?? 0,
      }));
    },
    staleTime: 60_000,
  });
}
