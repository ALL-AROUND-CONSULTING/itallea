import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { DayNutrition } from "@/hooks/useRangeNutrition";

type Props = {
  data: DayNutrition[] | undefined;
  isLoading: boolean;
  dataKey: "protein" | "carbs" | "fat";
  title: string;
  unit: string;
  target: number | null;
  color: string;
};

export function MacroChart({ data, isLoading, dataKey, title, unit, target, color }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !data || data.every((d) => d[dataKey] === 0) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nessun dato nel periodo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} className="fill-muted-foreground" interval={data.length > 14 ? Math.floor(data.length / 7) : 0} />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
                formatter={(value: number) => [`${value}${unit}`, title.replace(/^[^\s]+\s/, "")]}
              />
              {target && (
                <ReferenceLine y={target} stroke={color} strokeDasharray="6 3"
                  label={{ value: `${target}${unit}`, position: "right", fill: color, fontSize: 9 }}
                />
              )}
              <Bar dataKey={dataKey} fill={color} fillOpacity={0.75} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
