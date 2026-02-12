import { useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, Plus, TrendingUp } from "lucide-react";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useWaterHistory } from "@/hooks/useWaterHistory";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WATER_PRESETS = [
  { ml: 150, label: "150ml", icon: "💧" },
  { ml: 250, label: "250ml", icon: "🥤" },
  { ml: 500, label: "500ml", icon: "💧" },
  { ml: 700, label: "700ml", icon: "🥤" },
  { ml: 1000, label: "1L", icon: "🫗" },
  { ml: 1500, label: "1.5L", icon: "💦" },
];

function HumanSilhouette({ percentage }: { percentage: number }) {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const bodyHeight = 180;
  const fillY = bodyHeight - (bodyHeight * clampedPct) / 100;

  return (
    <svg width="80" height="180" viewBox="0 0 80 180" className="drop-shadow-sm">
      <defs>
        <clipPath id="bodyClip">
          {/* Head */}
          <circle cx="40" cy="22" r="14" />
          {/* Neck */}
          <rect x="35" y="36" width="10" height="8" />
          {/* Torso */}
          <path d="M20 44 L60 44 L58 100 L22 100 Z" />
          {/* Left arm */}
          <path d="M20 44 L8 80 L14 82 L24 52 Z" />
          {/* Right arm */}
          <path d="M60 44 L72 80 L66 82 L56 52 Z" />
          {/* Left leg */}
          <path d="M22 100 L18 170 L30 170 L34 100 Z" />
          {/* Right leg */}
          <path d="M46 100 L50 170 L62 170 L58 100 Z" />
        </clipPath>
      </defs>
      {/* Body outline */}
      <circle cx="40" cy="22" r="14" className="fill-muted" />
      <rect x="35" y="36" width="10" height="8" className="fill-muted" />
      <path d="M20 44 L60 44 L58 100 L22 100 Z" className="fill-muted" />
      <path d="M20 44 L8 80 L14 82 L24 52 Z" className="fill-muted" />
      <path d="M60 44 L72 80 L66 82 L56 52 Z" className="fill-muted" />
      <path d="M22 100 L18 170 L30 170 L34 100 Z" className="fill-muted" />
      <path d="M46 100 L50 170 L62 170 L58 100 Z" className="fill-muted" />
      {/* Water fill */}
      <rect
        x="0"
        y={fillY}
        width="80"
        height={bodyHeight - fillY}
        clipPath="url(#bodyClip)"
        fill="hsl(210, 80%, 55%)"
        className="transition-all duration-700"
      />
      {/* Wave line */}
      {clampedPct > 0 && clampedPct < 100 && (
        <path
          d={`M0 ${fillY} Q20 ${fillY - 3} 40 ${fillY} Q60 ${fillY + 3} 80 ${fillY}`}
          clipPath="url(#bodyClip)"
          fill="hsl(210, 80%, 60%)"
          opacity="0.5"
        />
      )}
    </svg>
  );
}

export default function Hydration() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { totalMl, count, addGlass, removeLastGlass } = useWaterLog();
  const { data: history } = useWaterHistory("7d");

  const goalMl = profile?.water_goal_ml ?? 2000;
  const percentage = Math.min((totalMl / goalMl) * 100, 100);

  const handleAdd = (ml: number) => {
    addGlass.mutate(ml, {
      onSuccess: () => toast.success(`+${ml}ml 💧`),
      onError: () => toast.error("Errore nell'aggiunta"),
    });
  };

  const handleRemove = () => {
    if (count === 0) return;
    removeLastGlass.mutate(undefined, {
      onSuccess: () => toast.success("Rimosso"),
      onError: () => toast.error("Errore nella rimozione"),
    });
  };

  // Compute weekly average
  const weekAvg =
    history && history.length > 0
      ? Math.round(history.reduce((s, d) => s + d.ml, 0) / history.length)
      : 0;

  const liters = (totalMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);

  return (
    <div className="flex flex-col bg-background min-h-[100dvh]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b">
        <button onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Idratazione</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        <div className="mx-auto w-full max-w-sm space-y-5">
          {/* Main card with silhouette */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-6">
              <HumanSilhouette percentage={percentage} />
              <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{liters}</span>
                  <span className="text-sm text-muted-foreground">L</span>
                </div>
                <div className="text-xs text-muted-foreground">Obiettivo: {goalLiters} L</div>
                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      background: "hsl(210, 80%, 55%)",
                    }}
                  />
                </div>
                <div className="text-xs font-medium" style={{ color: "hsl(210, 80%, 55%)" }}>
                  {Math.round(percentage)}% completato
                </div>
              </div>
            </div>
          </div>

          {/* Quick add */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Aggiungi acqua</h2>
            <div className="grid grid-cols-3 gap-2">
              {WATER_PRESETS.map((preset) => (
                <button
                  key={preset.ml}
                  onClick={() => handleAdd(preset.ml)}
                  disabled={addGlass.isPending}
                  className="flex flex-col items-center gap-1 rounded-2xl border bg-card px-3 py-3 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs font-semibold text-foreground">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Remove last */}
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={handleRemove}
            disabled={count === 0 || removeLastGlass.isPending}
          >
            <Minus className="mr-2 h-4 w-4" />
            Rimuovi ultima registrazione
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{count}</div>
              <div className="text-[11px] text-muted-foreground">Registrazioni oggi</div>
            </div>
            <div className="rounded-2xl border bg-card p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" style={{ color: "hsl(210, 80%, 55%)" }} />
                <span className="text-2xl font-bold text-foreground">{weekAvg}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">Media ml/giorno (7gg)</div>
            </div>
          </div>

          {/* Weekly mini chart */}
          {history && history.length > 0 && (
            <div className="rounded-2xl border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Ultimi 7 giorni</h3>
              <div className="flex items-end justify-between gap-1" style={{ height: 80 }}>
                {history.slice(-7).map((day) => {
                  const maxMl = Math.max(...history.slice(-7).map((d) => d.ml), goalMl);
                  const barH = maxMl > 0 ? (day.ml / maxMl) * 100 : 0;
                  const isToday = day.date === new Date().toISOString().split("T")[0];
                  return (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                      <div className="relative w-full flex justify-center" style={{ height: 60 }}>
                        <div
                          className="w-5 rounded-t-md transition-all duration-300"
                          style={{
                            height: `${Math.max(barH * 0.6, 2)}px`,
                            background: isToday ? "hsl(210, 80%, 55%)" : "hsl(210, 80%, 85%)",
                            position: "absolute",
                            bottom: 0,
                          }}
                        />
                      </div>
                      <span className={`text-[9px] ${isToday ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Goal line label */}
              <div className="mt-1 text-right text-[9px] text-muted-foreground">
                Obiettivo: {goalLiters}L
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
