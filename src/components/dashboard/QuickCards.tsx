import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";

function BodySilhouette({ fillPct }: { fillPct: number }) {
  const clampedPct = Math.min(Math.max(fillPct, 0), 100);
  // fillY: 0% = bottom(90), 100% = top(10)
  const fillY = 90 - (clampedPct / 100) * 80;

  return (
    <svg width="36" height="60" viewBox="0 0 36 90" fill="none">
      <defs>
        <clipPath id="bodyClip">
          {/* Head */}
          <circle cx="18" cy="12" r="7" />
          {/* Torso */}
          <path d="M10 22 C6 24, 4 32, 6 42 L6 55 Q6 60, 10 62 L10 80 Q10 86, 14 86 L22 86 Q26 86, 26 80 L26 62 Q30 60, 30 55 L30 42 C32 32, 30 24, 26 22 Z" />
        </clipPath>
      </defs>
      {/* Body outline */}
      <circle cx="18" cy="12" r="7" stroke="hsl(200, 80%, 75%)" strokeWidth="1.5" fill="hsl(200, 90%, 95%)" />
      <path
        d="M10 22 C6 24, 4 32, 6 42 L6 55 Q6 60, 10 62 L10 80 Q10 86, 14 86 L22 86 Q26 86, 26 80 L26 62 Q30 60, 30 55 L30 42 C32 32, 30 24, 26 22 Z"
        stroke="hsl(200, 80%, 75%)"
        strokeWidth="1.5"
        fill="hsl(200, 90%, 95%)"
      />
      {/* Water fill */}
      <rect
        x="0"
        y={fillY}
        width="36"
        height={90 - fillY}
        fill="hsl(200, 85%, 60%)"
        clipPath="url(#bodyClip)"
        style={{ transition: "y 0.5s ease, height 0.5s ease" }}
      />
    </svg>
  );
}

export function QuickCards() {
  const navigate = useNavigate();
  const { totalMl } = useWaterLog();
  const { profile } = useAuth();
  const goalMl = profile?.water_goal_ml ?? 2500;

  const pct = Math.min((totalMl / goalMl) * 100, 100);

  const formatted = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(1).replace(".0", "")} L` : `${ml} ml`;

  return (
    <div className="mx-4 mt-1 grid grid-cols-2 gap-3">
      {/* Hydration */}
      <Card className="flex cursor-pointer flex-col gap-1.5 border-0 p-3 shadow-md" onClick={() => navigate("/hydration")}>
        <p className="text-sm font-bold text-foreground">Idratazione</p>

        <div className="flex items-center gap-2">
          <BodySilhouette fillPct={pct} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {/* Droplet icon inline */}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="hsl(200, 85%, 55%)">
                <path d="M8 1.5C8 1.5 3 7 3 10.5C3 13 5.2 15 8 15C10.8 15 13 13 13 10.5C13 7 8 1.5 8 1.5Z" />
              </svg>
              <span className="text-lg font-bold" style={{ color: "hsl(var(--brand-blue))" }}>
                {formatted(totalMl)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Obiettivo: {formatted(goalMl)}
            </p>
          </div>
        </div>

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
        className="flex cursor-pointer flex-col gap-1.5 border-0 p-3 shadow-md"
        onClick={() => navigate("/my-products")}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "hsl(24, 80%, 93%)" }}
          >
            <UtensilsCrossed className="h-4 w-4 text-accent" />
          </div>
          <p className="text-sm font-bold text-foreground">Il mio database</p>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Aggiungi ricetta o alimento
        </p>
      </Card>
    </div>
  );
}
