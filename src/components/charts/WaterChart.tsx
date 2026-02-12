import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { DayWater } from "@/hooks/useWaterHistory";

type Props = {
  data: DayWater[] | undefined;
  isLoading: boolean;
  goalMl: number;
};

export function WaterChart({ data, isLoading, goalMl }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">💧 Idratazione</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !data || data.every((d) => d.ml === 0) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nessun dato acqua nel periodo.</p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} className="fill-muted-foreground" interval={data.length > 14 ? Math.floor(data.length / 7) : 0} />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.5rem", fontSize: 12 }}
                formatter={(value: number) => [`${value} ml`, "Acqua"]}
              />
              <ReferenceLine y={goalMl} stroke="hsl(210, 80%, 55%)" strokeDasharray="6 3"
                label={{ value: `${goalMl} ml`, position: "right", fill: "hsl(210, 80%, 55%)", fontSize: 9 }}
              />
              <Bar dataKey="ml" fill="hsl(210, 80%, 55%)" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
