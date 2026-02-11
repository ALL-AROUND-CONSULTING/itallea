import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type WeightEntry = {
  id: string;
  weight_kg: number;
  logged_at: string;
};

export function useWeightLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];

  const history = useQuery({
    queryKey: ["weight-log-history"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weight_logs")
        .select("id, weight_kg, logged_at")
        .eq("user_id", user!.id)
        .order("logged_at", { ascending: true })
        .limit(90);
      if (error) throw error;
      return (data ?? []).map((d) => ({
        ...d,
        weight_kg: Number(d.weight_kg),
      })) as WeightEntry[];
    },
    staleTime: 60_000,
  });

  const logWeight = useMutation({
    mutationFn: async (weightKg: number) => {
      // Upsert: unique constraint on (user_id, logged_at)
      const { error } = await supabase.from("weight_logs").upsert(
        { user_id: user!.id, weight_kg: weightKg, logged_at: today },
        { onConflict: "user_id,logged_at" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weight-log-history"] });
    },
  });

  const latest = history.data?.at(-1) ?? null;

  return {
    history: history.data ?? [],
    latest,
    isLoading: history.isLoading,
    logWeight,
  };
}
