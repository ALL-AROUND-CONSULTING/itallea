import type { DailyNutrition } from "@/hooks/useDailyNutrition";
import { Card } from "@/components/ui/card";
import { Flag, Flame } from "lucide-react";

interface GoalsSlideProps {
  data: DailyNutrition;
}

export function GoalsSlide({ data }: GoalsSlideProps) {
  const { totals, targets } = data;
  const pct = targets.kcal > 0 ? totals.kcal / targets.kcal : 0;

  // Gauge: 180° semicircle from -180° to 0°
  const cx = 100;
  const cy = 90;
  const r = 70;

  // Build arc path helper
  const arcPath = (startAngle: number, endAngle: number) => {
    const toRad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const large = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Needle: 0% = -180° (full left), 100% ~= -25° (green zone), >110% enters red
  const maxPct = 1.3;
  const clampedPct = Math.min(pct, maxPct);
  const needleAngle = -180 + clampedPct * (180 / maxPct);
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = r - 12;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  const legends = [
    { label: "Sotto soglia", color: "hsl(210, 15%, 75%)" },
    { label: "Nel tuo obiettivo", color: "hsl(142, 55%, 45%)" },
    { label: "Sopra soglia", color: "hsl(0, 72%, 51%)" },
  ];

  return (
    <Card className="border-0 shadow-md px-5 py-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold text-foreground">Obiettivi</h3>
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--brand-blue))" }}>Oggi</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Rimanente = Obiettivo - Alimenti + Esercizi
      </p>

      <div className="flex items-center gap-4">
        {/* Gauge */}
        <div className="flex-shrink-0">
          <svg width="200" height="110" viewBox="0 0 200 110">
            {/* Gray zone: 0% – 75% of target */}
            <path d={arcPath(-180, -76)} fill="none" stroke="hsl(210, 15%, 80%)" strokeWidth="14" strokeLinecap="round" />
            {/* Green zone: 75% – 110% of target */}
            <path d={arcPath(-76, -28)} fill="none" stroke="hsl(142, 55%, 45%)" strokeWidth="14" strokeLinecap="round" />
            {/* Red zone: >110% of target */}
            <path d={arcPath(-28, 0)} fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="14" strokeLinecap="round" />
            {/* Needle */}
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="hsl(var(--foreground))" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="4" fill="hsl(var(--foreground))" />
          </svg>
        </div>

        {/* Right info */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Obiettivo base</p>
              <p className="text-sm font-bold text-foreground">{targets.kcal}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
            <div>
              <p className="text-[10px] text-muted-foreground">Alimenti</p>
              <p className="text-sm font-bold text-foreground">{totals.kcal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-border">
        {legends.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
