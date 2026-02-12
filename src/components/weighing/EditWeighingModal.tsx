import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type WeighingItem = {
  id: string;
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

interface EditWeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WeighingItem;
  mealType: string;
  dateStr: string;
}

export function EditWeighingModal({
  open,
  onOpenChange,
  item,
  mealType,
  dateStr,
}: EditWeighingModalProps) {
  const queryClient = useQueryClient();
  const [grams, setGrams] = useState(item.grams.toString());
  const [meal, setMeal] = useState(mealType);
  const [saving, setSaving] = useState(false);

  // Calculate per-gram ratios from original values
  const perGram = useMemo(
    () => ({
      kcal: item.grams > 0 ? item.kcal / item.grams : 0,
      protein: item.grams > 0 ? item.protein / item.grams : 0,
      carbs: item.grams > 0 ? item.carbs / item.grams : 0,
      fat: item.grams > 0 ? item.fat / item.grams : 0,
    }),
    [item]
  );

  const newGrams = parseFloat(grams) || 0;
  const preview = {
    kcal: Math.round(perGram.kcal * newGrams * 10) / 10,
    protein: Math.round(perGram.protein * newGrams * 10) / 10,
    carbs: Math.round(perGram.carbs * newGrams * 10) / 10,
    fat: Math.round(perGram.fat * newGrams * 10) / 10,
  };

  const handleSave = async () => {
    if (newGrams <= 0) {
      toast.error("Inserisci un peso valido");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("weighings")
      .update({
        grams: newGrams,
        meal_type: meal as "breakfast" | "lunch" | "dinner" | "snack",
        kcal: preview.kcal,
        protein: preview.protein,
        carbs: preview.carbs,
        fat: preview.fat,
      })
      .eq("id", item.id);

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success("Pesata aggiornata!");
      queryClient.invalidateQueries({ queryKey: ["daily-nutrition", dateStr] });
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>✏️ Modifica Pesata</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product name (read-only) */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-semibold text-foreground">{item.name}</p>
          </div>

          {/* Grams */}
          <div className="space-y-1">
            <Label className="text-xs">Grammi</Label>
            <Input
              type="number"
              min="1"
              max="5000"
              step="1"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              autoFocus
            />
          </div>

          {/* Live preview */}
          {newGrams > 0 && (
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-primary/5 p-3 text-center">
              <div>
                <div className="text-sm font-bold text-primary">{preview.kcal}</div>
                <div className="text-[9px] text-muted-foreground">kcal</div>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{preview.protein}g</div>
                <div className="text-[9px] text-muted-foreground">Proteine</div>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{preview.carbs}g</div>
                <div className="text-[9px] text-muted-foreground">Carbo</div>
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{preview.fat}g</div>
                <div className="text-[9px] text-muted-foreground">Grassi</div>
              </div>
            </div>
          )}

          {/* Meal selector */}
          <div className="space-y-1">
            <Label className="text-xs">Pasto</Label>
            <Select value={meal} onValueChange={setMeal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">☀️ Colazione</SelectItem>
                <SelectItem value="lunch">🍝 Pranzo</SelectItem>
                <SelectItem value="dinner">🌙 Cena</SelectItem>
                <SelectItem value="snack">🍎 Spuntini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" disabled={saving || newGrams <= 0} onClick={handleSave}>
            {saving ? "Salvataggio…" : "Aggiorna ✓"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
