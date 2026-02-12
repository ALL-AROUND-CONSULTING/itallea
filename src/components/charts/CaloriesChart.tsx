import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import type { DayNutrition } from "@/hooks/useRangeNutrition";

type Props = {
  data: DayNutrition[] | undefined;
  isLoading: boolean;
  targetKcal: number | null;
};

export function CaloriesChart({ data, isLoading, targetKcal }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">🔥 Calorie</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !data || data.every((d) => d.kcal === 0) ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Nessun dato calorie nel periodo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} className="fill-muted-foreground" interval={data.length > 14 ? Math.floor(data.length / 7) : 0} />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
                formatter={(value: number) => [`${value} kcal`, "Calorie"]}
              />
              {targetKcal && (
                <ReferenceLine y={targetKcal} stroke="hsl(var(--accent))" strokeDasharray="6 3"
                  label={{ value: `Target ${targetKcal}`, position: "right", fill: "hsl(var(--accent))", fontSize: 9 }}
                />
              )}
              <Bar dataKey="kcal" radius={[4, 4, 0, 0]}>
                {(data ?? []).map((entry, index) => (
                  <Cell key={index} fill={targetKcal && entry.kcal > targetKcal ? "hsl(var(--accent))" : "hsl(var(--primary))"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
