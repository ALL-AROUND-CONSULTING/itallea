import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightLog } from "@/hooks/useWeightLog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function WeightSlide() {
  const { profile } = useAuth();
  const { latest, history, logWeight } = useWeightLog();
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);

  const currentWeight = latest?.weight_kg ?? (profile as any)?.current_weight ?? null;
  const initialWeight = history.length > 0 ? history[0].weight_kg : currentWeight;
  const variation =
    initialWeight && currentWeight && initialWeight !== 0
      ? (((currentWeight - initialWeight) / initialWeight) * 100).toFixed(1)
      : null;
  const variationNum = variation ? parseFloat(variation) : null;

  // Sparkline from last 10 entries
  const sparkData = history.slice(-10);
  const sparkMinMax = () => {
    if (sparkData.length < 2) return { min: 0, max: 100 };
    const vals = sparkData.map((d) => d.weight_kg);
    const mn = Math.min(...vals);
    const mx = Math.max(...vals);
    const pad = (mx - mn) * 0.15 || 1;
    return { min: mn - pad, max: mx + pad };
  };
  const { min, max } = sparkMinMax();
  const sparkW = 200;
  const sparkH = 50;
  const points = sparkData
    .map((d, i) => {
      const x = (i / Math.max(sparkData.length - 1, 1)) * sparkW;
      const y = sparkH - ((d.weight_kg - min) / (max - min)) * sparkH;
      return `${x},${y}`;
    })
    .join(" ");

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
        setShowInput(false);
      },
      onError: () => toast.error("Errore nel salvataggio"),
    });
  };

  return (
    <Card className="border-0 shadow-md p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-foreground">Peso</h3>
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--brand-blue))" }}>Oggi</span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 mb-3">
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Iniziale</p>
          <p className="text-xs font-bold text-foreground">{initialWeight?.toFixed(2) ?? "—"} kg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Attuale</p>
          <p className="text-xs font-bold text-foreground">{currentWeight?.toFixed(2) ?? "—"} kg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">Variazione</p>
          <p
            className="text-xs font-bold"
            style={{
              color:
                variationNum === null
                  ? "hsl(var(--muted-foreground))"
                  : variationNum <= 0
                  ? "hsl(142, 55%, 40%)"
                  : "hsl(0, 72%, 51%)",
            }}
          >
            {variation !== null ? `${variationNum! > 0 ? "+" : ""}${variation}%` : "—"}
          </p>
        </div>
      </div>

      {/* Big weight */}
      <div className="text-center mb-2">
        <span className="text-4xl font-bold text-foreground">
          {currentWeight?.toFixed(2) ?? "—"}
        </span>
        <span className="text-base text-muted-foreground ml-1">kg</span>
      </div>

      {/* Sparkline */}
      {sparkData.length >= 2 && (
        <div className="flex justify-center mb-3">
          <svg width={sparkW} height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`}>
            <polyline
              points={points}
              fill="none"
              stroke="hsl(var(--brand-blue))"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Add weight */}
      {showInput ? (
        <div className="flex gap-2 mx-auto max-w-[220px]">
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
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleLog}
            disabled={logWeight.isPending || !input}
            className="rounded-full"
            style={{ background: "hsl(var(--brand-blue))" }}
          >
            Salva
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="mx-auto flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white"
          style={{ background: "hsl(var(--brand-blue))" }}
        >
          <Plus className="h-4 w-4" />
          Inserisci peso
        </button>
      )}
    </Card>
  );
}
