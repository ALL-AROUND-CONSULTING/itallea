import { ProgressRing } from "./ProgressRing";
import type { DailyNutrition } from "@/hooks/useDailyNutrition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoalsSlideProps {
  data: DailyNutrition;
}

export function GoalsSlide({ data }: GoalsSlideProps) {
  const { totals, targets, percentages } = data;

  return (
    <Card className="mx-2 h-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-sm font-semibold">🎯 Obiettivi Giornalieri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around">
          <ProgressRing
            value={percentages.kcal}
            current={totals.kcal}
            target={targets.kcal}
            label="Calorie"
            color="hsl(var(--primary))"
            size={76}
          />
          <ProgressRing
            value={percentages.protein}
            current={totals.protein}
            target={targets.protein}
            label="Proteine"
            unit="g"
            color="hsl(var(--chart-3))"
            size={76}
          />
          <ProgressRing
            value={percentages.carbs}
            current={totals.carbs}
            target={targets.carbs}
            label="Carbo"
            unit="g"
            color="hsl(var(--accent))"
            size={76}
          />
          <ProgressRing
            value={percentages.fat}
            current={totals.fat}
            target={targets.fat}
            label="Grassi"
            unit="g"
            color="hsl(var(--chart-4))"
            size={76}
          />
        </div>
      </CardContent>
    </Card>
  );
}
