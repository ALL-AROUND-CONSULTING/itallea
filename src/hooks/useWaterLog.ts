import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export function useWaterLog(date?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dateStr = date || new Date().toISOString().split("T")[0];

  const query = useQuery({
    queryKey: ["water-log", dateStr],
    enabled: !!user,
    queryFn: async () => {
      // Fetch total ml from API summary
      const data = await apiClient<any>("/api/app/water_logs/summary", {
        method: "POST",
        body: { start_date: dateStr, end_date: dateStr },
      });
      const days = Array.isArray(data) ? data : data.records ?? [data];
      const day = days.find((d: any) => d.date === dateStr) ?? days[0];
      const totalMl = day?.value ?? day?.total_ml ?? 0;

      // Fetch entry count from API (try /get endpoint)
      let entryCount = 0;
      try {
        const entries = await apiClient<any>("/api/app/water_logs/get", {
          method: "POST",
          body: { date: dateStr },
        });
        const list = Array.isArray(entries) ? entries : entries.records ?? [];
        entryCount = list.length;
      } catch {
        // If /get endpoint doesn't exist, try to derive count from summary
        entryCount = day?.count ?? day?.entries_count ?? (totalMl > 0 ? 1 : 0);
      }

      return { totalMl, entryCount };
    },
    staleTime: 30_000,
  });

  const addGlass = useMutation({
    mutationFn: async (amountMl: number = 250) => {
      await apiClient("/api/app/water_logs/add", {
        method: "POST",
        body: { value: amountMl },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["water-history"] });
    },
  });

  const removeLastGlass = useMutation({
    mutationFn: async () => {
      await apiClient("/api/app/water_logs/delete-last", {
        method: "POST",
        body: {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["water-history"] });
    },
  });

  return {
    totalMl: query.data?.totalMl ?? 0,
    count: query.data?.entryCount ?? 0,
    isLoading: query.isLoading,
    addGlass,
    removeLastGlass,
  };
}
