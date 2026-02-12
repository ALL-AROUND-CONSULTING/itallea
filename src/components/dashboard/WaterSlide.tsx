import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Minus, Droplets } from "lucide-react";
import { toast } from "sonner";

const WATER_PRESETS = [
  { ml: 250, label: "250ml", icon: "🥛" },
  { ml: 500, label: "500ml", icon: "🧴" },
  { ml: 700, label: "700ml", icon: "🫙" },
  { ml: 1000, label: "1L", icon: "🍶" },
  { ml: 1500, label: "1.5L", icon: "💧" },
];

export function WaterSlide() {
  const { profile } = useAuth();
  const { totalMl, count, addGlass, removeLastGlass } = useWaterLog();

  const goalMl = profile?.water_goal_ml ?? 2000;
  const percentage = Math.min((totalMl / goalMl) * 100, 100);

  const handleAdd = (ml: number) => {
    addGlass.mutate(ml, {
      onError: () => toast.error("Errore nell'aggiunta"),
    });
  };

  const handleRemove = () => {
    if (count === 0) return;
    removeLastGlass.mutate(undefined, {
      onError: () => toast.error("Errore nella rimozione"),
    });
  };

  const dropHeight = 120;
  const fillY = dropHeight - (dropHeight * percentage) / 100;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-center text-sm font-semibold text-foreground">
        💧 Idratazione
      </h2>

      <div className="flex items-center justify-center gap-6">
        <div className="relative">
          <svg width="80" height="120" viewBox="0 0 80 120" className="drop-shadow-sm">
            <defs>
              <clipPath id="dropClip">
                <path d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z" />
              </clipPath>
            </defs>
            <path
              d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z"
              className="fill-muted stroke-border"
              strokeWidth="1.5"
            />
            <rect
              x="0"
              y={fillY}
              width="80"
              height={dropHeight - fillY}
              clipPath="url(#dropClip)"
              className="fill-primary/70 transition-all duration-500"
            />
            {percentage > 0 && percentage < 100 && (
              <path
                d={`M10 ${fillY} Q25 ${fillY - 4} 40 ${fillY} Q55 ${fillY + 4} 70 ${fillY}`}
                clipPath="url(#dropClip)"
                className="fill-primary/50"
              />
            )}
            <path
              d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z"
              fill="none"
              className="stroke-primary/40"
              strokeWidth="1.5"
            />
            <text x="40" y="78" textAnchor="middle" className="fill-foreground text-sm font-bold" fontSize="14">
              {Math.round(percentage)}%
            </text>
          </svg>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {totalMl}
              <span className="text-sm font-normal text-muted-foreground"> ml</span>
            </div>
            <div className="text-xs text-muted-foreground">di {goalMl} ml</div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplets className="h-3 w-3" />
            <span>{count} registrazion{count === 1 ? "e" : "i"}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={handleRemove}
            disabled={count === 0 || removeLastGlass.isPending}
          >
            <Minus className="mr-1 h-3 w-3" /> Rimuovi ultima
          </Button>
        </div>
      </div>

      {/* Quick-add preset buttons */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {WATER_PRESETS.map((preset) => (
          <button
            key={preset.ml}
            onClick={() => handleAdd(preset.ml)}
            disabled={addGlass.isPending}
            className="flex flex-col items-center gap-0.5 rounded-xl border bg-background px-3 py-2 text-center shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="text-lg">{preset.icon}</span>
            <span className="text-[10px] font-semibold text-foreground">{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
