import { useState } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useProductSearch, SearchableProduct } from "@/hooks/useProductSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Search, Plus, X, Loader2 } from "lucide-react";

type TempIngredient = {
  product_name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  product_id: string | null;
  user_product_id: string | null;
};

type Props = {
  category: string;
  onSaved: () => void;
  onCancel: () => void;
};

export function RecipeForm({ category, onSaved, onCancel }: Props) {
  const { createRecipe } = useRecipes();
  const [name, setName] = useState("");
  const [servings, setServings] = useState("1");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState<TempIngredient[]>([]);
  const [saving, setSaving] = useState(false);

  // Ingredient search
  const [searchQuery, setSearchQuery] = useState("");
  const [gramsInput, setGramsInput] = useState("100");
  const { results, isLoading } = useProductSearch(searchQuery);

  const addIngredient = (product: SearchableProduct) => {
    const grams = parseFloat(gramsInput) || 100;
    const factor = grams / 100;
    const ingredient: TempIngredient = {
      product_name: product.name,
      grams,
      kcal: Math.round(product.kcal_per_100g * factor * 10) / 10,
      protein: Math.round(product.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(product.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(product.fat_per_100g * factor * 10) / 10,
      product_id: product.source === "products" ? product.id : null,
      user_product_id: product.source === "user_products" ? product.id : null,
    };
    setIngredients((prev) => [...prev, ingredient]);
    setSearchQuery("");
    setGramsInput("100");
    toast.success(`${product.name} aggiunto`);
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const totals = ingredients.reduce(
    (acc, i) => ({
      kcal: acc.kcal + i.kcal,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const servingsNum = parseInt(servings) || 1;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    if (ingredients.length === 0) {
      toast.error("Aggiungi almeno un ingrediente");
      return;
    }
    setSaving(true);
    const id = await createRecipe(name.trim(), category, servingsNum, notes.trim() || null, ingredients);
    if (id) {
      toast.success("Ricetta creata!");
      onSaved();
    } else {
      toast.error("Errore nella creazione");
    }
    setSaving(false);
  };

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-bold text-foreground">Nuova Ricetta</h2>
      </div>

      <div className="space-y-4">
        {/* Name & servings */}
        <div className="space-y-1">
          <Label className="text-xs">Nome ricetta *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Porzioni</Label>
            <Input type="number" min="1" value={servings} onChange={(e) => setServings(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Categoria</Label>
            <Input value={category} disabled className="bg-muted" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Note (opzionale)</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </div>

        {/* Ingredient search */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Aggiungi ingredienti</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca alimento…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Input
              type="number"
              min="1"
              placeholder="g"
              value={gramsInput}
              onChange={(e) => setGramsInput(e.target.value)}
              className="w-20"
            />
          </div>

          {/* Search results */}
          {isLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {results.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-lg border bg-background">
              {results.map((p) => (
                <button
                  key={`${p.source}-${p.id}`}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
                  onClick={() => addIngredient(p)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.kcal_per_100g} kcal · P {p.protein_per_100g}g · C {p.carbs_per_100g}g · G {p.fat_per_100g}g
                    </p>
                  </div>
                  <Plus className="h-4 w-4 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients list */}
        {ingredients.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Ingredienti ({ingredients.length})
            </Label>
            <div className="space-y-1">
              {ingredients.map((ing, i) => (
                <Card key={i} className="flex items-center justify-between px-3 py-2 border-0 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{ing.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ing.grams}g · {Math.round(ing.kcal)} kcal
                    </p>
                  </div>
                  <button onClick={() => removeIngredient(i)} className="p-1 text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </Card>
              ))}
            </div>

            {/* Totals */}
            <Card className="border-0 shadow-sm p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Totale ricetta</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-foreground">{Math.round(totals.kcal)}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{Math.round(totals.protein)}g</p>
                  <p className="text-[10px] text-muted-foreground">Proteine</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{Math.round(totals.carbs)}g</p>
                  <p className="text-[10px] text-muted-foreground">Carbo</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{Math.round(totals.fat)}g</p>
                  <p className="text-[10px] text-muted-foreground">Grassi</p>
                </div>
              </div>
              {servingsNum > 1 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground mt-2 mb-1">Per porzione ({servingsNum})</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-foreground">{Math.round(totals.kcal / servingsNum)}</p>
                      <p className="text-[10px] text-muted-foreground">kcal</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{Math.round(totals.protein / servingsNum)}g</p>
                      <p className="text-[10px] text-muted-foreground">Proteine</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{Math.round(totals.carbs / servingsNum)}g</p>
                      <p className="text-[10px] text-muted-foreground">Carbo</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{Math.round(totals.fat / servingsNum)}g</p>
                      <p className="text-[10px] text-muted-foreground">Grassi</p>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? "Salvataggio…" : "Crea Ricetta"}
        </Button>
      </div>
    </div>
  );
}
