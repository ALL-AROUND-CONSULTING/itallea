import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import type { WeightEntry } from "@/hooks/useWeightLog";

type Props = {
  history: WeightEntry[];
  isLoading: boolean;
  targetWeight: number | null;
};

export function WeightChart({ history, isLoading, targetWeight }: Props) {
  const chartData = history.map((e) => ({
    date: e.logged_at,
    label: format(parseISO(e.logged_at), "d MMM", { locale: it }),
    peso: e.weight_kg,
  }));

  const weights = history.map((e) => e.weight_kg);
  if (targetWeight) weights.push(targetWeight);
  const minW = weights.length ? Math.floor(Math.min(...weights) - 2) : 50;
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 2) : 100;

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">⚖️ Storico Peso</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : chartData.length < 2 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                Registra almeno 2 pesate dalla Home per vedere il grafico.
              </p>
              <p className="text-xs text-muted-foreground">
                {chartData.length === 1
                  ? `Hai 1 pesata (${chartData[0].label}: ${chartData[0].peso} kg)`
                  : "Nessuna pesata registrata"}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <YAxis domain={[minW, maxW]} tick={{ fontSize: 10 }} className="fill-muted-foreground" unit=" kg" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
                  formatter={(value: number) => [`${value} kg`, "Peso"]}
                />
                {targetWeight && (
                  <ReferenceLine y={targetWeight} stroke="hsl(var(--accent))" strokeDasharray="6 3"
                    label={{ value: `Obiettivo ${targetWeight} kg`, position: "right", fill: "hsl(var(--accent))", fontSize: 10 }}
                  />
                )}
                <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Stats summary */}
      {history.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">📊 Riepilogo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">{history[0].weight_kg} kg</div>
                <div className="text-[10px] text-muted-foreground">Inizio</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{history.at(-1)!.weight_kg} kg</div>
                <div className="text-[10px] text-muted-foreground">Attuale</div>
              </div>
              <div>
                {(() => {
                  const delta = history.at(-1)!.weight_kg - history[0].weight_kg;
                  const sign = delta > 0 ? "+" : "";
                  return (
                    <>
                      <div className={`text-lg font-bold ${delta < 0 ? "text-primary" : delta > 0 ? "text-accent" : "text-foreground"}`}>
                        {sign}{delta.toFixed(1)} kg
                      </div>
                      <div className="text-[10px] text-muted-foreground">Variazione</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
