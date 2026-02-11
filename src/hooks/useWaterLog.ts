import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
      const { data, error } = await supabase
        .from("water_logs")
        .select("id, amount_ml")
        .eq("user_id", user!.id)
        .eq("logged_at", dateStr);
      if (error) throw error;
      const totalMl = (data ?? []).reduce((sum, r) => sum + r.amount_ml, 0);
      return { entries: data ?? [], totalMl, count: data?.length ?? 0 };
    },
    staleTime: 30_000,
  });

  const addGlass = useMutation({
    mutationFn: async (amountMl: number = 250) => {
      const { error } = await supabase.from("water_logs").insert({
        user_id: user!.id,
        amount_ml: amountMl,
        logged_at: dateStr,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
    },
  });

  const removeLastGlass = useMutation({
    mutationFn: async () => {
      const last = query.data?.entries.at(-1);
      if (!last) return;
      const { error } = await supabase
        .from("water_logs")
        .delete()
        .eq("id", last.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["water-log", dateStr] });
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
