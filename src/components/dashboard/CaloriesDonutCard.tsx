import { Card } from "@/components/ui/card";
import type { DailyNutrition } from "@/hooks/useDailyNutrition";

const RADIUS = 60;
const STROKE = 16;
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

  const legends = [
    { label: "Sotto soglia", color: "hsl(142, 55%, 40%)" },
    { label: "Nel tuo obiettivo", color: "hsl(24, 80%, 55%)" },
    { label: "Sopra soglia", color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <Card className="mx-4 mb-4 overflow-hidden border-0 shadow-md">
      {/* Title area */}
      <div className="px-5 pt-5 pb-1 text-center">
        <p
          className="text-sm font-semibold"
          style={{ color: "hsl(var(--brand-blue))" }}
        >
          Oggi
        </p>
        <p className="text-xl font-bold text-foreground">Calorie</p>
        <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span>Rimanente</span>
          <span>·</span>
          <span>Obiettivo</span>
          <span>·</span>
          <span>Alimenti</span>
        </div>
      </div>

      {/* Donut + legend row */}
      <div className="flex items-center justify-center gap-6 px-5 py-4">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Background ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={STROKE}
            />
            {/* Segments */}
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={STROKE}
                strokeDasharray={`${a.dash} ${CIRCUMFERENCE - a.dash}`}
                strokeDashoffset={a.offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">
              {remaining}
            </span>
            <span className="text-[10px] text-muted-foreground">rimanenti</span>
          </div>
        </div>

        {/* Right legend */}
        <div className="flex flex-col gap-3">
          {arcs.map((a) => (
            <div key={a.key} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: a.color }}
              />
              <div>
                <p className="text-xs text-muted-foreground">{a.label}</p>
                <p className="text-sm font-semibold text-foreground">
                  {a.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom legends */}
      <div className="flex items-center justify-center gap-4 border-t px-5 py-3">
        {legends.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: l.color }}
            />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        <div
          className="h-1.5 w-5 rounded-full"
          style={{ background: "hsl(var(--brand-blue))" }}
        />
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
      </div>
    </Card>
  );
}
