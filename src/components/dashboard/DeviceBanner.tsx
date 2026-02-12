import { useEffect, useState } from "react";
import { ChevronRight, Scale } from "lucide-react";
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

/** SVG illustration: tablet/scale with NFC hand + Italian flag accent */
function DeviceIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Shadow / back plate */}
      <rect x="18" y="12" width="100" height="70" rx="12" fill="hsl(0 0% 85%)" />
      {/* Device body */}
      <rect x="12" y="8" width="100" height="70" rx="12" fill="none" stroke="hsl(var(--brand-blue))" strokeWidth="3" />
      <rect x="12" y="8" width="100" height="70" rx="12" fill="white" fillOpacity="0.85" />
      {/* Camera dot */}
      <circle cx="88" cy="18" r="3" fill="hsl(var(--brand-blue))" opacity="0.5" />
      {/* Italian flag accent bottom-right of device */}
      <rect x="74" y="68" width="10" height="5" rx="1" fill="#009246" />
      <rect x="84" y="68" width="10" height="5" rx="1" fill="white" stroke="#ccc" strokeWidth="0.3" />
      <rect x="94" y="68" width="10" height="5" rx="1" fill="#CE2B37" />
      {/* Phone / NFC icon */}
      <rect x="90" y="24" width="28" height="42" rx="6" fill="none" stroke="hsl(var(--brand-blue))" strokeWidth="2.5" />
      <circle cx="104" cy="30" r="1.5" fill="hsl(var(--brand-blue))" opacity="0.5" />
      {/* Hand with NFC waves */}
      <g transform="translate(88, 38)">
        {/* Waves */}
        <path d="M22 14 Q26 10 22 6" stroke="hsl(var(--brand-blue))" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M26 16 Q32 10 26 4" stroke="hsl(var(--brand-blue))" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M30 18 Q38 10 30 2" stroke="hsl(var(--brand-blue))" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Hand */}
        <path d="M6 28 L6 16 Q6 12 10 12 L14 12 Q18 12 18 16 L18 20 L22 14 Q22 12 20 10" stroke="hsl(var(--brand-blue))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 28 L2 32 Q0 34 2 36 L10 36 Q14 36 16 32 L18 26" stroke="hsl(var(--brand-blue))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

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
      <div className="mx-4 mb-0 mt-0">
        {/* Badge gradient */}
        <button
          onClick={() => navigate("/pair-device")}
          className="mb-2 flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-sm"
          style={{
            background: "linear-gradient(135deg, hsl(var(--brand-blue)), hsl(200, 80%, 65%))",
          }}
        >
          Il mio dispositivo
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Add device card */}
        <div
          className="relative flex items-center rounded-2xl border border-border/40 p-4 shadow-sm cursor-pointer overflow-hidden transition-transform active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(210 60% 97%), hsl(200 70% 94%))",
          }}
          onClick={() => navigate("/pair-device")}
        >
          {/* Text content */}
          <div className="flex-1 min-w-0 z-10">
            <p className="text-sm font-bold text-foreground">Aggiungi dispositivo</p>
            <p className="text-xs text-muted-foreground mt-0.5">Inizia il tuo viaggio con Ital Lea</p>
          </div>

          {/* Illustration area */}
          <div className="relative shrink-0 ml-2">
            {/* Blue + circle */}
            <div
              className="absolute -top-2 -left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full shadow-md"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v12M3 9h12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <DeviceIllustration className="h-20 w-28" />
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
