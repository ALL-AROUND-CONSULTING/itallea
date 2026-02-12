import { useEffect, useState } from "react";
import { ChevronRight, Scale, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

type Device = {
  id: string;
  hardware_device_id: string;
  serial_number: string | null;
  is_active: boolean;
  paired_at: string;
};

export function DeviceBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("devices")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("paired_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setDevice(data as Device | null);
        setLoading(false);
      });
  }, [user]);

  if (loading) return null;

  if (!device) {
    return (
      <div className="mx-4 mb-0">
        {/* Badge */}
        <button
          onClick={() => navigate("/profile")}
          className="mb-2 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ background: "hsl(var(--brand-blue))" }}
        >
          Il mio dispositivo
          <ChevronRight className="h-3 w-3" />
        </button>

        {/* Add device card */}
        <div
          className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-sm cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "hsl(var(--brand-light-blue))" }}
            >
              <Scale className="h-6 w-6" style={{ color: "hsl(var(--brand-blue))" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Aggiungi dispositivo</p>
              <p className="text-xs text-muted-foreground">Inizia il tuo viaggio con Ital Lea</p>
            </div>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "hsl(var(--brand-blue))" }}
          >
            <Plus className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-0">
      <div
        className="flex items-center justify-between rounded-2xl p-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, hsl(var(--brand-dark-blue)), hsl(var(--brand-blue)))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Il mio dispositivo</p>
            <p className="text-xs text-white/70">
              Bilancia connessa{device.serial_number && ` · S/N ${device.serial_number}`}
            </p>
          </div>
        </div>
        <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
      </div>
    </div>
  );
}
