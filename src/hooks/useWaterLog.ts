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
      const data = await apiClient<any>("/api/app/water_logs/summary/", {
        method: "POST",
        body: { start_date: dateStr, end_date: dateStr },
      });
      // API returns an array of day summaries
      const days = Array.isArray(data) ? data : data.records ?? [data];
      const day = days.find((d: any) => d.date === dateStr) ?? days[0];
      const totalMl = day?.total_ml ?? 0;
      const count = day?.count ?? 0;
      return { totalMl, count };
    },
    staleTime: 30_000,
  });

  const addGlass = useMutation({
    mutationFn: async (amountMl: number = 250) => {
      await apiClient("/api/app/water_logs/add/", {
        method: "POST",
        body: { amount_ml: amountMl, logged_at: dateStr },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["water-history"] });
    },
  });

  const removeLastGlass = useMutation({
    mutationFn: async () => {
      await apiClient("/api/app/water_logs/delete-last/", {
        method: "POST",
        body: { logged_at: dateStr },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["water-history"] });
    },
  });

  return {
    totalMl: query.data?.totalMl ?? 0,
    count: query.data?.count ?? 0,
    isLoading: query.isLoading,
    addGlass,
    removeLastGlass,
  };
}
