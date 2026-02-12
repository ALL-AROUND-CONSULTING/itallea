import { useNavigate } from "react-router-dom";
import { Droplets, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";

export function QuickCards() {
  const navigate = useNavigate();
  const { totalMl } = useWaterLog();
  const { profile } = useAuth();
  const goalMl = profile?.water_goal_ml ?? 2500;

  const pct = Math.min((totalMl / goalMl) * 100, 100);

  const formatted = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(1).replace(".0", "")} L` : `${ml} ml`;

  return (
    <div className="mx-4 mb-6 mt-4 grid grid-cols-2 gap-3">
      {/* Hydration */}
      <Card className="flex flex-col gap-2 border-0 p-4 shadow-md">
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "hsl(200, 90%, 92%)" }}
          >
            <Droplets className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </div>
          <p className="text-sm font-semibold text-foreground">Idratazione</p>
        </div>
        <p className="text-lg font-bold" style={{ color: "hsl(var(--brand-blue))" }}>
          {formatted(totalMl)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Obiettivo: {formatted(goalMl)}
        </p>
        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: "hsl(var(--brand-blue))",
            }}
          />
        </div>
      </Card>

      {/* Database */}
      <Card
        className="flex cursor-pointer flex-col gap-2 border-0 p-4 shadow-md"
        onClick={() => navigate("/my-products")}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "hsl(24, 80%, 93%)" }}
          >
            <UtensilsCrossed className="h-5 w-5 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">Il mio database</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Aggiungi ricetta o alimento
        </p>
      </Card>
    </div>
  );
}
