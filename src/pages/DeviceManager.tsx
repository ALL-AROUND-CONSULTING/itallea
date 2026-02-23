import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale, Activity, Users, ChevronRight, Package } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DeviceWeighing {
  id: string;
  product_name: string;
  grams: number;
  kcal: number;
  created_at: string;
  meal_type: string;
}

const DeviceManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [device, setDevice] = useState<any>(null);
  const [weighings, setWeighings] = useState<DeviceWeighing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      // Get active device
      const { data: dev } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("paired_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setDevice(dev);

      if (dev) {
        // Get device weighings (those with device_profile_id set)
        const { data: w } = await supabase
          .from("weighings")
          .select("id, product_name, grams, kcal, created_at, meal_type, device_profile_id")
          .eq("user_id", user.id)
          .not("device_profile_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        setWeighings((w as DeviceWeighing[]) ?? []);
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const todayWeighings = weighings.filter(
    (w) => new Date(w.created_at).toDateString() === new Date().toDateString()
  );

  const mealLabel: Record<string, string> = {
    breakfast: "Colazione",
    lunch: "Pranzo",
    dinner: "Cena",
    snack: "Spuntino",
  };

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div
        className="relative overflow-hidden pb-5"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={() => navigate("/settings")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </button>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            ⚖️ La mia bilancia
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-sm space-y-4 px-4 py-4">
        {!device ? (
          <Card className="border-dashed p-6 text-center">
            <Scale className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">Nessuna bilancia collegata</p>
            <Button
              className="rounded-xl"
              style={{ background: "hsl(var(--brand-blue))" }}
              onClick={() => navigate("/pair-device")}
            >
              Collega bilancia
            </Button>
          </Card>
        ) : (
          <>
            {/* Device status */}
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Scale className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Bilancia collegata</p>
                  <p className="text-xs text-muted-foreground truncate">
                    ID: {device.hardware_device_id}
                    {device.serial_number && ` · S/N ${device.serial_number}`}
                  </p>
                </div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" title="Attiva" />
              </div>
              <p className="text-xs text-muted-foreground">
                Collegata il {format(new Date(device.paired_at), "d MMM yyyy", { locale: it })}
              </p>
            </Card>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 text-center">
                <Activity className="mx-auto mb-1 h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
                <p className="text-2xl font-bold">{todayWeighings.length}</p>
                <p className="text-[10px] text-muted-foreground">Pesate oggi</p>
              </Card>
              <Card className="p-4 text-center">
                <Package className="mx-auto mb-1 h-5 w-5" style={{ color: "hsl(var(--accent))" }} />
                <p className="text-2xl font-bold">{weighings.length}</p>
                <p className="text-[10px] text-muted-foreground">Pesate totali</p>
              </Card>
            </div>

            {/* Profiles link */}
            <button
              className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-medium shadow-sm"
              onClick={() => navigate("/pair-device")}
            >
              <Users className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
              <span>Gestisci profili bilancia</span>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </button>

            {/* Recent weighings */}
            <div>
              <h2 className="text-sm font-semibold mb-2">Ultime pesate dal dispositivo</h2>
              {weighings.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nessuna pesata registrata dal dispositivo</p>
              ) : (
                <div className="space-y-2">
                  {weighings.slice(0, 20).map((w) => (
                    <Card key={w.id} className="flex items-center gap-3 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{w.product_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {w.grams}g · {mealLabel[w.meal_type] ?? w.meal_type}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{Math.round(w.kcal)} kcal</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(w.created_at), "d MMM HH:mm", { locale: it })}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DeviceManager;
