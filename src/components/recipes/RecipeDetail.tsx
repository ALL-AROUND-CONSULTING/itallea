import { useState, useEffect } from "react";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

type Props = {
  recipeId: string;
  onBack: () => void;
};

export function RecipeDetail({ recipeId, onBack }: Props) {
  const { fetchRecipeWithIngredients } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipeWithIngredients(recipeId).then((r) => {
      setRecipe(r);
      setLoading(false);
    });
  }, [recipeId, fetchRecipeWithIngredients]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="px-4 pt-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <p className="text-center text-sm text-muted-foreground mt-8">Ricetta non trovata</p>
      </div>
    );
  }

  const servings = recipe.servings || 1;

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground">{recipe.name}</h2>
          <p className="text-xs text-muted-foreground">
            {recipe.category} · {servings} {servings === 1 ? "porzione" : "porzioni"}
          </p>
        </div>
      </div>

      {recipe.notes && (
        <p className="text-sm text-muted-foreground mb-4 italic">{recipe.notes}</p>
      )}

      {/* Macro totals */}
      <Card className="border-0 shadow-sm p-3 mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-1">Totale ricetta</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-sm font-bold text-foreground">{Math.round(recipe.total_kcal ?? 0)}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{Math.round(recipe.total_protein ?? 0)}g</p>
            <p className="text-[10px] text-muted-foreground">Proteine</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{Math.round(recipe.total_carbs ?? 0)}g</p>
            <p className="text-[10px] text-muted-foreground">Carbo</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{Math.round(recipe.total_fat ?? 0)}g</p>
            <p className="text-[10px] text-muted-foreground">Grassi</p>
          </div>
        </div>
        {servings > 1 && (
          <>
            <p className="text-xs font-semibold text-muted-foreground mt-2 mb-1">Per porzione</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-sm font-bold text-foreground">{Math.round((recipe.total_kcal ?? 0) / servings)}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{Math.round((recipe.total_protein ?? 0) / servings)}g</p>
                <p className="text-[10px] text-muted-foreground">Proteine</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{Math.round((recipe.total_carbs ?? 0) / servings)}g</p>
                <p className="text-[10px] text-muted-foreground">Carbo</p>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{Math.round((recipe.total_fat ?? 0) / servings)}g</p>
                <p className="text-[10px] text-muted-foreground">Grassi</p>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Ingredients */}
      <p className="text-xs font-semibold text-muted-foreground mb-2">
        Ingredienti ({recipe.ingredients?.length ?? 0})
      </p>
      <div className="space-y-0 divide-y divide-border">
        {recipe.ingredients?.map((ing) => (
          <div key={ing.id} className="py-2.5">
            <p className="text-sm font-medium text-foreground">{ing.product_name}</p>
            <p className="text-xs text-muted-foreground">
              {ing.grams}g · {Math.round(ing.kcal)} kcal · P {Math.round(ing.protein)}g · C {Math.round(ing.carbs)}g · G {Math.round(ing.fat)}g
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
