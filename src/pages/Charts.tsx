import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import logoImg from "@/assets/logo-itallea.png";
import { useWeightLog } from "@/hooks/useWeightLog";
import { useRangeNutrition, type RangeKey } from "@/hooks/useRangeNutrition";
import { useWaterHistory } from "@/hooks/useWaterHistory";
import { CaloriesChart } from "@/components/charts/CaloriesChart";
import { MacroChart } from "@/components/charts/MacroChart";
import { WaterChart } from "@/components/charts/WaterChart";
import { WeightChart } from "@/components/charts/WeightChart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "7d", label: "7G" },
  { value: "30d", label: "1M" },
  { value: "90d", label: "3M" },
  { value: "180d", label: "6M" },
];

const Charts = () => {
  const { profile } = useAuth();
  const [range, setRange] = useState<RangeKey>("7d");
  const { data: nutritionData, isLoading: nutritionLoading } = useRangeNutrition(range);
  const { data: waterData, isLoading: waterLoading } = useWaterHistory(range);
  const { history, isLoading: weightLoading } = useWeightLog();

  const targetKcal = profile?.target_kcal ? Number(profile.target_kcal) : null;
  const targetProtein = profile?.target_protein ? Number(profile.target_protein) : null;
  const targetCarbs = profile?.target_carbs ? Number(profile.target_carbs) : null;
  const targetFat = profile?.target_fat ? Number(profile.target_fat) : null;
  const targetWeight = profile?.target_weight ? Number(profile.target_weight) : null;
  const waterGoal = profile?.water_goal_ml ? Number(profile.water_goal_ml) : 2000;

  return (
    <>
      <div
        className="relative overflow-hidden pb-5"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        <div className="flex items-center justify-center pt-6 pb-1">
          <img src={logoImg} alt="ItalLea" className="h-12" style={{ objectFit: "contain" }} />
        </div>
        <h1
          className="pb-4 text-center text-xl font-bold tracking-tight"
          style={{ color: "hsl(var(--brand-dark-blue))" }}
        >
          Grafici
        </h1>
      </div>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
        {/* Range selector */}
        <Tabs value={range} onValueChange={(v) => setRange(v as RangeKey)}>
          <TabsList className="grid w-full grid-cols-4">
            {RANGE_OPTIONS.map((o) => (
              <TabsTrigger key={o.value} value={o.value} className="text-xs">
                {o.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <CaloriesChart data={nutritionData} isLoading={nutritionLoading} targetKcal={targetKcal} />
        <MacroChart data={nutritionData} isLoading={nutritionLoading} dataKey="protein" title="🥩 Proteine" unit="g" target={targetProtein} color="hsl(var(--chart-3))" />
        <MacroChart data={nutritionData} isLoading={nutritionLoading} dataKey="carbs" title="🍞 Carboidrati" unit="g" target={targetCarbs} color="hsl(var(--accent))" />
        <MacroChart data={nutritionData} isLoading={nutritionLoading} dataKey="fat" title="🧈 Grassi" unit="g" target={targetFat} color="hsl(var(--chart-4))" />
        <WaterChart data={waterData} isLoading={waterLoading} goalMl={waterGoal} />
        <WeightChart history={history} isLoading={weightLoading} targetWeight={targetWeight} />
      </div>
    </>
  );
};

export default Charts;
