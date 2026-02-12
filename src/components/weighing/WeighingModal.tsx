import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
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
import { toast } from "sonner";
import { Search, X, ScanLine, Plus, ChevronDown, ChevronLeft, Heart, Pencil } from "lucide-react";
import {
  useProductSearch,
  type SearchableProduct,
} from "@/hooks/useProductSearch";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WeighingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MEAL_OPTIONS = [
  { value: "breakfast", label: "🌅 Prima Colazione" },
  { value: "lunch", label: "☀️ Pranzo" },
  { value: "dinner", label: "🌙 Cena" },
  { value: "snack", label: "🍪 Snack" },
];

const TABS = ["Tutti", "I miei pasti", "Le mie ricette", "I miei alimenti"];

export function WeighingModal({ open, onOpenChange }: WeighingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<SearchableProduct | null>(null);
  const [grams, setGrams] = useState("");
  const [mealType, setMealType] = useState<string>("breakfast");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { results, isLoading: searching } = useProductSearch(query);

  const preview = useMemo(() => {
    if (!selectedProduct || !grams) return null;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return null;
    const factor = g / 100;
    return {
      kcal: Math.round(selectedProduct.kcal_per_100g * factor * 10) / 10,
      protein:
        Math.round(selectedProduct.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(selectedProduct.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(selectedProduct.fat_per_100g * factor * 10) / 10,
    };
  }, [selectedProduct, grams]);

  const handleSave = useCallback(async () => {
    if (!user || !selectedProduct) return;
    const g = parseFloat(grams) || 100;
    const factor = g / 100;
    const computedPreview = {
      kcal: Math.round(selectedProduct.kcal_per_100g * factor * 10) / 10,
      protein: Math.round(selectedProduct.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(selectedProduct.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(selectedProduct.fat_per_100g * factor * 10) / 10,
    };
    setSaving(true);
    setSaving(true);

    const { error } = await supabase.from("weighings").insert({
      user_id: user.id,
      product_id:
        selectedProduct.source === "products" ? selectedProduct.id : null,
      user_product_id:
        selectedProduct.source === "user_products"
          ? selectedProduct.id
          : null,
      product_name: selectedProduct.name,
      grams: g,
      meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      kcal: computedPreview.kcal,
      protein: computedPreview.protein,
      carbs: computedPreview.carbs,
      fat: computedPreview.fat,
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
    setMealType("breakfast");
    setActiveTab(0);
    onOpenChange(false);
  };

  const handleScanBarcode = () => {
    resetAndClose();
    navigate("/scan");
  };

  const currentMealLabel =
    MEAL_OPTIONS.find((m) => m.value === mealType)?.label ?? "Pasto";

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(v); }}>
      <DrawerContent className="mx-auto h-[92dvh] max-w-lg rounded-t-3xl border-0 p-0 flex flex-col">
        {/* ── Header ── */}
        {!selectedProduct ? (
          <div
            className="flex items-center justify-between rounded-t-3xl px-4 pb-3 pt-5"
            style={{ background: "hsl(var(--brand-blue))" }}
          >
            <button
              onClick={resetAndClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="h-auto w-auto gap-1 border-0 bg-transparent p-0 text-base font-bold text-white shadow-none focus:ring-0 [&>svg]:hidden">
                <span className="flex items-center gap-1">
                  <SelectValue />
                  <ChevronDown className="h-4 w-4 text-white/80" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {MEAL_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-10" />
          </div>
        ) : (
          <div className="flex items-center gap-3 border-b px-4 pb-3 pt-5">
            <button onClick={() => setSelectedProduct(null)}>
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <span className="text-base font-semibold text-foreground">Informazioni sul cibo</span>
          </div>
        )}

        {/* ── Search bar ── */}
        <div className="px-4 pt-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedProduct(null); }}
                className="rounded-xl border bg-muted/50 pl-9 text-sm"
                autoFocus
              />
            </div>
            <button
              onClick={handleScanBarcode}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              <ScanLine className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 overflow-x-auto px-4 pt-3 text-xs font-medium">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "shrink-0 whitespace-nowrap pb-1.5 transition-colors",
                i === activeTab
                  ? "border-b-2 font-semibold"
                  : "text-muted-foreground",
              )}
              style={
                i === activeTab
                  ? { borderColor: "hsl(var(--brand-blue))", color: "hsl(var(--brand-blue))" }
                  : undefined
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto px-4 pt-2 pb-4">
          {!selectedProduct ? (
            <>
              {/* Results label */}
              <p className="pb-1 text-xs text-muted-foreground">
                Risultati della ricerca:
              </p>

              {searching && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Ricerca…
                </p>
              )}

              {!searching && query.length >= 2 && results.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <p className="text-xs text-muted-foreground">0 risultati</p>
                  <button className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: "hsl(var(--brand-blue))" }}
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--brand-blue))" }}>
                      Aggiungi alimento
                    </span>
                  </button>
                </div>
              )}

              {!searching && query.length < 2 && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <p className="text-xs text-muted-foreground">0 risultati</p>
                  <button className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: "hsl(var(--brand-blue))" }}
                    >
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "hsl(var(--brand-blue))" }}>
                      Aggiungi alimento
                    </span>
                  </button>
                </div>
              )}

              {/* Product list */}
              <div className="space-y-1">
                {results.map((product) => (
                  <button
                    key={`${product.source}-${product.id}`}
                    onClick={() => setSelectedProduct(product)}
                    className="flex w-full items-center gap-3 rounded-xl bg-card p-3 text-left transition-colors active:bg-muted"
                  >
                    {/* Thumbnail placeholder */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                      🍽️
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {product.brand
                          ? `${product.name} - ${product.brand}`
                          : product.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.kcal_per_100g}kcal / 100g
                      </div>
                    </div>

                    <Plus className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ── Food info view (mockup faithful) ── */
            <div className="flex flex-1 flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto pt-2">
                {/* Product card with macros */}
                <div className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                      🍽️
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground">
                        {selectedProduct.brand
                          ? `${selectedProduct.name} - ${selectedProduct.brand}`
                          : selectedProduct.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedProduct.kcal_per_100g}kcal / 100g
                      </div>
                    </div>
                  </div>

                  {/* Colored macro row */}
                  <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold" style={{ color: "#ef7b45" }}>
                        {preview ? preview.kcal : selectedProduct.kcal_per_100g}
                        <span className="text-xs font-normal">kcal</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Calorie</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: "#5ba0d9" }}>
                        {preview ? preview.carbs : selectedProduct.carbs_per_100g}
                        <span className="text-xs font-normal">g</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Carboidrati</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: "#6bc26b" }}>
                        {preview ? preview.protein : selectedProduct.protein_per_100g}
                        <span className="text-xs font-normal">g</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Proteine</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ color: "#f5c542" }}>
                        {preview ? preview.fat : selectedProduct.fat_per_100g}
                        <span className="text-xs font-normal">g</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">Grasso</div>
                    </div>
                  </div>
                </div>

                {/* Portion size */}
                <div className="rounded-2xl border bg-card p-4">
                  <p className="mb-3 text-xs font-medium text-muted-foreground">Dimensione della porzione</p>
                  <div className="flex items-end justify-center gap-2">
                    <Pencil className="mb-1 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={grams || "100"}
                      onChange={(e) => setGrams(e.target.value)}
                      className="w-24 border-b-2 border-foreground bg-transparent text-center text-4xl font-bold text-foreground outline-none"
                      autoFocus
                    />
                    <span className="mb-1 text-sm text-muted-foreground">g</span>
                  </div>
                  {/* Unit selector */}
                  <div className="mt-4 flex justify-center gap-1">
                    {["oz", "ml", "lb.oz", "g", "fl.oz"].map((unit) => (
                      <button
                        key={unit}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          unit === "g"
                            ? "border-2 text-foreground"
                            : "text-muted-foreground"
                        )}
                        style={unit === "g" ? { borderColor: "hsl(var(--brand-blue))", color: "hsl(var(--brand-blue))" } : undefined}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutrienti */}
                <div>
                  <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">Nutrienti</p>
                  <div className="rounded-2xl border bg-card divide-y">
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm text-foreground">Zuccheri totali (g)</span>
                      <span className="text-sm text-muted-foreground">0</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm text-foreground">Fibra alimentare (g)</span>
                      <span className="text-sm text-muted-foreground">0</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3.5">
                      <span className="text-sm text-foreground">Colesterolo (mg)</span>
                      <span className="text-sm text-muted-foreground">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center gap-3 border-t bg-card px-4 py-3">
                <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                </button>
                <Button
                  className="h-12 flex-1 rounded-xl text-base font-semibold"
                  disabled={saving}
                  onClick={() => {
                    if (!grams) setGrams("100");
                    handleSave();
                  }}
                  style={{ background: "hsl(var(--brand-blue))" }}
                >
                  {saving ? "Salvataggio…" : "Aggiungi cibo"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
