import type { DailyNutrition } from "@/hooks/useDailyNutrition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "🌅 Colazione",
  lunch: "☀️ Pranzo",
  dinner: "🌙 Cena",
  snack: "🍪 Snack",
};

interface MealCaloriesSlideProps {
  data: DailyNutrition;
}

export function MealCaloriesSlide({ data }: MealCaloriesSlideProps) {
  const { mealTotals, totals } = data;
  const maxKcal = Math.max(
    ...Object.values(mealTotals).map((m) => m.kcal),
    1
  );

  return (
    <Card className="mx-2 h-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-sm font-semibold">🔥 Calorie per Pasto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(MEAL_LABELS).map(([key, label]) => {
          const kcal = mealTotals[key]?.kcal ?? 0;
          const pct = maxKcal > 0 ? (kcal / maxKcal) * 100 : 0;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-muted-foreground">{Math.round(kcal)} kcal</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        <div className="border-t pt-2 text-center">
          <span className="text-xs font-semibold text-foreground">
            Totale: {Math.round(totals.kcal)} kcal
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
