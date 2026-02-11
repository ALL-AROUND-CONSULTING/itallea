import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { useProductSearch, type SearchableProduct } from "@/hooks/useProductSearch";

interface WeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeighingModal({ open, onOpenChange }: WeighingModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<SearchableProduct | null>(null);
  const [grams, setGrams] = useState("");
  const [mealType, setMealType] = useState<string>("lunch");
  const [saving, setSaving] = useState(false);

  const { results, isLoading: searching } = useProductSearch(query);

  const preview = useMemo(() => {
    if (!selectedProduct || !grams) return null;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return null;
    const factor = g / 100;
    return {
      kcal: Math.round(selectedProduct.kcal_per_100g * factor * 10) / 10,
      protein: Math.round(selectedProduct.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(selectedProduct.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(selectedProduct.fat_per_100g * factor * 10) / 10,
    };
  }, [selectedProduct, grams]);

  const handleSave = useCallback(async () => {
    if (!user || !selectedProduct || !preview) return;
    setSaving(true);

    const { error } = await supabase.from("weighings").insert({
      user_id: user.id,
      product_id: selectedProduct.source === "products" ? selectedProduct.id : null,
      user_product_id: selectedProduct.source === "user_products" ? selectedProduct.id : null,
      product_name: selectedProduct.name,
      grams: parseFloat(grams),
      meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      kcal: preview.kcal,
      protein: preview.protein,
      carbs: preview.carbs,
      fat: preview.fat,
    });

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success(`${selectedProduct.name} aggiunto!`);
      queryClient.invalidateQueries({ queryKey: ["daily-nutrition"] });
      resetAndClose();
    }
    setSaving(false);
  }, [user, selectedProduct, preview, grams, mealType, queryClient]);

  const resetAndClose = () => {
    setQuery("");
    setSelectedProduct(null);
    setGrams("");
    setMealType("lunch");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>➕ Nuova Pesata</DialogTitle>
        </DialogHeader>

        {!selectedProduct ? (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca alimento…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="max-h-60 space-y-1 overflow-y-auto">
              {searching && (
                <p className="py-4 text-center text-xs text-muted-foreground">Ricerca…</p>
              )}
              {!searching && query.length >= 2 && results.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">Nessun risultato</p>
              )}
              {results.map((product) => (
                <button
                  key={`${product.source}-${product.id}`}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full rounded-lg border bg-card p-2.5 text-left transition-colors hover:bg-muted"
                >
                  <div className="text-sm font-medium text-foreground">{product.name}</div>
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    {product.brand && <span>{product.brand}</span>}
                    <span>{product.kcal_per_100g} kcal/100g</span>
                    {product.source === "user_products" && (
                      <span className="rounded bg-accent/20 px-1 text-accent">Mio</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected product */}
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-sm font-semibold text-foreground">{selectedProduct.name}</div>
              {selectedProduct.brand && (
                <div className="text-xs text-muted-foreground">{selectedProduct.brand}</div>
              )}
              <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
                <span>{selectedProduct.kcal_per_100g} kcal</span>
                <span>P {selectedProduct.protein_per_100g}g</span>
                <span>C {selectedProduct.carbs_per_100g}g</span>
                <span>G {selectedProduct.fat_per_100g}g</span>
                <span className="ml-auto text-muted-foreground/60">per 100g</span>
              </div>
            </div>

            {/* Grams input */}
            <div className="space-y-1">
              <Label className="text-xs">Grammi</Label>
              <Input
                type="number"
                step="1"
                min="1"
                max="2000"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
                placeholder="150"
                autoFocus
              />
            </div>

            {/* Live preview */}
            {preview && (
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
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Colazione</SelectItem>
                  <SelectItem value="lunch">☀️ Pranzo</SelectItem>
                  <SelectItem value="dinner">🌙 Cena</SelectItem>
                  <SelectItem value="snack">🍪 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>
                Cambia
              </Button>
              <Button
                className="flex-1"
                disabled={!preview || saving}
                onClick={handleSave}
              >
                {saving ? "Salvataggio…" : "Salva ✓"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
