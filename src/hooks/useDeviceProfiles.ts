import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DeviceProfile = {
  id: string;
  device_id: string;
  profile_index: number;
  name: string;
  linked_user_id: string | null;
  created_at: string;
};

export function useDeviceProfiles(deviceId: string | null) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["device-profiles", deviceId];

  const query = useQuery({
    queryKey: key,
    enabled: !!deviceId && !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("device_profiles")
        .select("*")
        .eq("device_id", deviceId!)
        .order("profile_index", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as DeviceProfile[];
    },
  });

  const addProfile = useMutation({
    mutationFn: async ({ name, profileIndex }: { name: string; profileIndex: number }) => {
      const { error } = await (supabase as any)
        .from("device_profiles")
        .insert({ device_id: deviceId!, name, profile_index: profileIndex });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, name, linkedUserId }: { id: string; name: string; linkedUserId?: string | null }) => {
      const update: any = { name };
      if (linkedUserId !== undefined) update.linked_user_id = linkedUserId;
      const { error } = await (supabase as any)
        .from("device_profiles")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const deleteProfile = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("device_profiles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { profiles: query.data ?? [], isLoading: query.isLoading, addProfile, updateProfile, deleteProfile };
}
