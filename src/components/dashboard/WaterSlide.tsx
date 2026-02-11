import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Droplets } from "lucide-react";
import { toast } from "sonner";

export function WaterSlide() {
  const { profile } = useAuth();
  const { totalMl, count, addGlass, removeLastGlass } = useWaterLog();

  const goalMl = profile?.water_goal_ml ?? 2000;
  const percentage = Math.min((totalMl / goalMl) * 100, 100);
  const glasses = Math.ceil(goalMl / 250);

  const handleAdd = () => {
    addGlass.mutate(250, {
      onError: () => toast.error("Errore nell'aggiunta"),
    });
  };

  const handleRemove = () => {
    if (count === 0) return;
    removeLastGlass.mutate(undefined, {
      onError: () => toast.error("Errore nella rimozione"),
    });
  };

  // SVG water drop with fill level
  const dropHeight = 120;
  const fillY = dropHeight - (dropHeight * percentage) / 100;

  return (
    <div className="rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-center text-sm font-semibold text-foreground">
        💧 Idratazione
      </h2>

      <div className="flex items-center justify-center gap-6">
        {/* SVG Water Drop */}
        <div className="relative">
          <svg
            width="80"
            height="120"
            viewBox="0 0 80 120"
            className="drop-shadow-sm"
          >
            <defs>
              <clipPath id="dropClip">
                <path d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z" />
              </clipPath>
            </defs>
            {/* Background drop */}
            <path
              d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z"
              className="fill-muted stroke-border"
              strokeWidth="1.5"
            />
            {/* Water fill */}
            <rect
              x="0"
              y={fillY}
              width="80"
              height={dropHeight - fillY}
              clipPath="url(#dropClip)"
              className="fill-primary/70 transition-all duration-500"
            />
            {/* Water surface wave */}
            {percentage > 0 && percentage < 100 && (
              <path
                d={`M10 ${fillY} Q25 ${fillY - 4} 40 ${fillY} Q55 ${fillY + 4} 70 ${fillY}`}
                clipPath="url(#dropClip)"
                className="fill-primary/50"
              />
            )}
            {/* Drop outline */}
            <path
              d="M40 5 C40 5 10 50 10 75 C10 97 23 115 40 115 C57 115 70 97 70 75 C70 50 40 5 40 5Z"
              fill="none"
              className="stroke-primary/40"
              strokeWidth="1.5"
            />
            {/* Percentage text */}
            <text
              x="40"
              y="78"
              textAnchor="middle"
              className="fill-foreground text-sm font-bold"
              fontSize="14"
            >
              {Math.round(percentage)}%
            </text>
          </svg>
        </div>

        {/* Info + Controls */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {totalMl}
              <span className="text-sm font-normal text-muted-foreground"> ml</span>
            </div>
            <div className="text-xs text-muted-foreground">
              di {goalMl} ml
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Droplets className="h-3 w-3" />
            <span>{count} bicchier{count === 1 ? "e" : "i"}</span>
          </div>

          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9"
              onClick={handleRemove}
              disabled={count === 0 || removeLastGlass.isPending}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9"
              onClick={handleAdd}
              disabled={addGlass.isPending}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Glass indicators */}
      <div className="mt-4 flex flex-wrap justify-center gap-1">
        {Array.from({ length: Math.min(glasses, 12) }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i < count ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
        {glasses > 12 && (
          <span className="ml-1 text-[9px] text-muted-foreground">+{glasses - 12}</span>
        )}
      </div>
    </div>
  );
}
