import { ProgressRing } from "./ProgressRing";
import type { DailyNutrition } from "@/hooks/useDailyNutrition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface GoalsSlideProps {
  data: DailyNutrition;
}

const rings = [
  { key: "kcal", label: "Calorie", color: "hsl(var(--primary))", unit: undefined },
  { key: "protein", label: "Proteine", color: "hsl(var(--chart-3))", unit: "g" },
  { key: "carbs", label: "Carbo", color: "hsl(var(--accent))", unit: "g" },
  { key: "fat", label: "Grassi", color: "hsl(var(--chart-4))", unit: "g" },
] as const;

export function GoalsSlide({ data }: GoalsSlideProps) {
  const { totals, targets, percentages } = data;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-sm font-semibold">🎯 Obiettivi Giornalieri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-around">
          {rings.map((r, i) => (
            <motion.div
              key={r.key}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.35, ease: "easeOut" }}
            >
              <ProgressRing
                value={percentages[r.key]}
                current={totals[r.key]}
                target={targets[r.key]}
                label={r.label}
                unit={r.unit}
                color={r.color}
                size={76}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
