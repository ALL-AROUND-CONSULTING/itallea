import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWaterLog(date?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dateStr = date || new Date().toISOString().split("T")[0];

  const query = useQuery({
    queryKey: ["water-log", dateStr],
    enabled: !!user,
    queryFn: async () => {
      // Fetch total ml from API
      const data = await apiClient<any>("/api/app/water_logs/summary", {
        method: "POST",
        body: { start_date: dateStr, end_date: dateStr },
      });
      const days = Array.isArray(data) ? data : data.records ?? [data];
      const day = days.find((d: any) => d.date === dateStr) ?? days[0];
      const totalMl = day?.value ?? day?.total_ml ?? 0;

      // Fetch actual entry count from database
      let entryCount = 0;
      if (user) {
        const { count } = await supabase
          .from("water_logs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("logged_at", dateStr);
        entryCount = count ?? 0;
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
