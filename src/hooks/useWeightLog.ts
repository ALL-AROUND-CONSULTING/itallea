import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
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
      const data = await apiClient<any>("/api/app/weight_logs/get/", {
        method: "POST",
        body: {},
      });
      const records = Array.isArray(data) ? data : data.records ?? [];
      return records.map((d: any) => ({
        id: d.id,
        weight_kg: Number(d.weight_kg),
        logged_at: d.logged_at,
      })) as WeightEntry[];
    },
    staleTime: 60_000,
  });

  const logWeight = useMutation({
    mutationFn: async (weightKg: number) => {
      await apiClient("/api/app/weight_logs/add/", {
        method: "POST",
        body: { weight_kg: weightKg, logged_at: today },
      });
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
