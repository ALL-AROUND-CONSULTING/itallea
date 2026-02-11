import { useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Trash2, Plus, Minus, Droplets } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const MEAL_CONFIG: { key: string; label: string; icon: string }[] = [
  { key: "breakfast", label: "Colazione", icon: "☀️" },
  { key: "lunch", label: "Pranzo", icon: "🍝" },
  { key: "dinner", label: "Cena", icon: "🌙" },
  { key: "snack", label: "Spuntini", icon: "🍎" },
];

const Diary = () => {
  const [date, setDate] = useState(new Date());
  const dateStr = format(date, "yyyy-MM-dd");
  const { data, isLoading } = useDailyNutrition(dateStr);
  const { profile } = useAuth();
  const { totalMl, count, addGlass, removeLastGlass } = useWaterLog(dateStr);
  const waterGoal = profile?.water_goal_ml ?? 2000;
  const waterPct = Math.min(Math.round((totalMl / waterGoal) * 100), 100);
  const queryClient = useQueryClient();

  const goBack = () => setDate((d) => subDays(d, 1));
  const goForward = () => {
    if (!isToday(date)) setDate((d) => addDays(d, 1));
  };

  const handleDelete = async (weighingId: string) => {
    const { error } = await supabase
      .from("weighings")
      .delete()
      .eq("id", weighingId);
    if (error) {
      toast.error("Errore durante l'eliminazione");
    } else {
      toast.success("Pesata eliminata");
      queryClient.invalidateQueries({ queryKey: ["daily-nutrition", dateStr] });
    }
  };

  const displayDate = isToday(date)
    ? "Oggi"
    : format(date, "EEEE d MMMM", { locale: it });

  return (
    <>
      <PageHeader title="Diario" />

      {/* Date Navigator */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" onClick={goBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold capitalize text-foreground">
          {displayDate}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={goForward}
          disabled={isToday(date)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Totals summary */}
      {data && (
        <div className="grid grid-cols-4 gap-2 px-4 py-3 text-center text-xs">
          {(["kcal", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <p className="font-bold text-foreground">
                {Math.round(data.totals[k])}
              </p>
              <p className="text-muted-foreground">
                {k === "kcal"
                  ? "kcal"
                  : k === "protein"
                  ? "Proteine"
                  : k === "carbs"
                  ? "Carbo"
                  : "Grassi"}
              </p>
            </div>
          ))}
        </div>
      )}

      <Separator />

      {/* Content */}
      <div className="flex-1 px-4 py-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <Accordion type="multiple" defaultValue={MEAL_CONFIG.map((m) => m.key)}>
              {MEAL_CONFIG.map((meal) => {
                const items = data?.meals?.[meal.key] ?? [];
                const mealTotal = data?.mealTotals?.[meal.key];
                const totalKcal = mealTotal ? Math.round(mealTotal.kcal) : 0;

                return (
                  <AccordionItem key={meal.key} value={meal.key}>
                    <AccordionTrigger className="py-3 hover:no-underline">
                      <div className="flex w-full items-center justify-between pr-2">
                        <span className="text-sm font-semibold">
                          {meal.icon} {meal.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalKcal} kcal
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {items.length === 0 ? (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          Nessun alimento registrato
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div
                              key={item.id ?? idx}
                              className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.grams}g · {Math.round(item.kcal)} kcal ·
                                  P {Math.round(item.protein)} · C{" "}
                                  {Math.round(item.carbs)} · G{" "}
                                  {Math.round(item.fat)}
                                </p>
                              </div>
                              {item.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-2 h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Water tracking */}
            <Separator className="my-3" />
            <div className="flex items-center justify-between rounded-xl border bg-card p-3">
              <div className="flex items-center gap-3">
                <Droplets className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    💧 Acqua · {totalMl} ml
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {count} bicchier{count === 1 ? "e" : "i"} · {waterPct}% di {waterGoal} ml
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => removeLastGlass.mutate()}
                  disabled={count === 0 || removeLastGlass.isPending}
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => addGlass.mutate(250)}
                  disabled={addGlass.isPending}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Diary;
