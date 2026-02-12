import { useEffect, useState } from "react";
import { ChevronRight, Scale, Wifi, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

  // No device paired — show CTA
  if (!device) {
    return (
      <div className="mx-4 -mt-2 mb-4">
        <motion.button
          onClick={() => navigate("/profile")}
          className="w-full rounded-2xl p-4 shadow-sm text-left"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--brand-dark-blue)), hsl(var(--brand-blue)))",
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-white">
                  Collega la tua bilancia
                  <ChevronRight className="h-4 w-4" />
                </p>
                <p className="text-xs text-white/70">
                  Scansiona il QR code dal profilo
                </p>
              </div>
            </div>
            <WifiOff className="h-4 w-4 text-white/50" />
          </div>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="mx-4 -mt-2 mb-4">
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--brand-dark-blue)), hsl(var(--brand-blue)))",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-white">
                Il mio dispositivo
                <ChevronRight className="h-4 w-4" />
              </p>
              <p className="text-xs text-white/70">
                Bilancia Ital Lea connessa
                {device.serial_number && ` · S/N ${device.serial_number}`}
              </p>
            </div>
          </div>
          <motion.div
            className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
