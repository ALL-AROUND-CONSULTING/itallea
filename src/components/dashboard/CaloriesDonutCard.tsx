import { Card } from "@/components/ui/card";
import type { DailyNutrition } from "@/hooks/useDailyNutrition";
import { motion } from "framer-motion";

const RADIUS = 55;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = RADIUS + STROKE / 2;
const SIZE = CENTER * 2;

type Props = { data: DailyNutrition };

const segments = [
  { key: "carbs", label: "Carboidrati", color: "hsl(210, 15%, 70%)" },
  { key: "protein", label: "Proteine", color: "hsl(210, 80%, 55%)" },
  { key: "fat", label: "Grassi", color: "hsl(24, 80%, 55%)" },
] as const;

export function CaloriesDonutCard({ data }: Props) {
  const { totals, targets } = data;
  const remaining = Math.max(0, targets.kcal - totals.kcal);

  const total = totals.carbs + totals.protein + totals.fat || 1;

  let offset = 0;
  const arcs = segments.map((s) => {
    const value = totals[s.key];
    const fraction = value / total;
    const dash = fraction * CIRCUMFERENCE;
    const arc = { ...s, value, dash, offset: -offset + CIRCUMFERENCE * 0.25 };
    offset += dash;
    return arc;
  });

  return (
    <Card className="border-0 shadow-md p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-foreground">Calorie</h3>
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--brand-blue))" }}>Oggi</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Rimanente = Obiettivo - Alimenti + Esercizi
      </p>

      <div className="flex items-center justify-center gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <circle
              cx={CENTER} cy={CENTER} r={RADIUS}
              fill="none" stroke="hsl(var(--muted))" strokeWidth={STROKE}
            />
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={CENTER} cy={CENTER} r={RADIUS}
                fill="none" stroke={a.color} strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
                strokeDashoffset={a.offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl font-bold text-foreground"
              key={remaining}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {remaining}
            </motion.span>
            <span className="text-[10px] text-muted-foreground">rimanenti</span>
          </div>
        </div>

        {/* Right legend */}
        <div className="flex flex-col gap-3">
          {arcs.map((a) => (
            <div key={a.key} className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: a.color }} />
              <div>
                <p className="text-xs text-muted-foreground">{a.label}</p>
                <p className="text-sm font-semibold text-foreground">{a.value}g</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
