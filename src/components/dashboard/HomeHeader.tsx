import { useAuth } from "@/contexts/AuthContext";
import { Bluetooth } from "lucide-react";

export function HomeHeader() {
  const { profile } = useAuth();
  const firstName = profile?.first_name || "Utente";
  const initials = (firstName[0] ?? "U").toUpperCase();

  return (
    <div className="relative">
      {/* Curved gradient background */}
      <div
        className="relative overflow-hidden pb-8"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 pt-10 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <span className="text-lg">🍽️</span>
          </div>
          <span
            className="text-2xl font-bold tracking-wide"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            ITAL LEA
          </span>
        </div>

        {/* Greeting row */}
        <div className="flex items-center justify-between px-5 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shadow"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bentornato</p>
              <p className="text-base font-semibold text-foreground">
                Ciao {firstName}
              </p>
            </div>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm"
            aria-label="Dispositivo"
          >
            <Bluetooth className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
