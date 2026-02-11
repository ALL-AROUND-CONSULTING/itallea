import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightLog } from "@/hooks/useWeightLog";
import { TrendingDown, TrendingUp, Minus, Save } from "lucide-react";
import { toast } from "sonner";

export function WeightSlide() {
  const { profile } = useAuth();
  const { latest, logWeight } = useWeightLog();
  const [input, setInput] = useState("");

  const currentWeight = latest?.weight_kg ?? (profile as any)?.current_weight ?? null;
  const targetWeight = (profile as any)?.target_weight ?? null;
  const diff = currentWeight && targetWeight ? currentWeight - targetWeight : null;

  const handleLog = () => {
    const val = parseFloat(input);
    if (isNaN(val) || val < 20 || val > 400) {
      toast.error("Inserisci un peso valido (20-400 kg)");
      return;
    }
    logWeight.mutate(val, {
      onSuccess: () => {
        toast.success("Peso registrato!");
        setInput("");
      },
      onError: () => toast.error("Errore nel salvataggio"),
    });
  };

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
            <p className="mt-1 text-xs text-muted-foreground">
              {latest ? `Ultimo: ${latest.logged_at}` : "Peso attuale"}
            </p>
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

          {/* Quick log */}
          <div className="flex w-full max-w-[200px] gap-2">
            <Input
              type="number"
              step="0.1"
              min="20"
              max="400"
              placeholder="es. 75.2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLog()}
              className="text-center"
            />
            <Button
              size="icon"
              onClick={handleLog}
              disabled={logWeight.isPending || !input}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">Registra il peso di oggi</p>
        </div>
      </CardContent>
    </Card>
  );
}
