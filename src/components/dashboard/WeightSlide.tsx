import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function WeightSlide() {
  const { user } = useAuth();
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("current_weight, target_weight")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCurrentWeight(data.current_weight ? Number(data.current_weight) : null);
          setTargetWeight(data.target_weight ? Number(data.target_weight) : null);
        }
      });
  }, [user]);

  const diff = currentWeight && targetWeight ? currentWeight - targetWeight : null;

  return (
    <Card className="mx-2 h-full">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-center text-sm font-semibold">⚖️ Peso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-foreground">
              {currentWeight ? `${currentWeight}` : "—"}
              <span className="text-lg font-normal text-muted-foreground"> kg</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Peso attuale</p>
          </div>

          {targetWeight && (
            <div className="flex items-center gap-4 rounded-lg bg-muted/50 px-4 py-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">{targetWeight} kg</div>
                <p className="text-[10px] text-muted-foreground">Obiettivo</p>
              </div>
              {diff !== null && (
                <div className="flex items-center gap-1">
                  {diff > 0 ? (
                    <TrendingDown className="h-4 w-4 text-accent" />
                  ) : diff < 0 ? (
                    <TrendingUp className="h-4 w-4 text-primary" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {diff > 0 ? `-${diff.toFixed(1)}` : diff < 0 ? `+${Math.abs(diff).toFixed(1)}` : "0"} kg
                  </span>
                </div>
              )}
            </div>
          )}

          {!currentWeight && (
            <p className="text-xs text-muted-foreground">Completa l'onboarding per vedere i dati</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
