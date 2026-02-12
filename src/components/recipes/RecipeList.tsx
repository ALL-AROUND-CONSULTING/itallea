import { useState } from "react";
import { useRecipes, Recipe } from "@/hooks/useRecipes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, ChefHat } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { RecipeForm } from "./RecipeForm";
import { RecipeDetail } from "./RecipeDetail";

type Props = {
  category: string;
  categoryIcon: string;
};

export function RecipeList({ category, categoryIcon }: Props) {
  const { recipes, loading, deleteRecipe, fetchRecipes } = useRecipes(category);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRecipe(deleteId);
    toast.success("Ricetta eliminata");
    setDeleteId(null);
  };

  if (selectedId) {
    return <RecipeDetail recipeId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  if (showForm) {
    return (
      <RecipeForm
        category={category}
        onSaved={() => {
          setShowForm(false);
          fetchRecipes();
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryIcon}</span>
          <h2 className="text-lg font-bold text-foreground">{category}</h2>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mr-1 h-4 w-4" /> Nuova
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && recipes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <ChefHat className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nessuna ricetta in "{category}" ancora.
          </p>
        </div>
      )}

      <div className="space-y-0 divide-y divide-border">
        {recipes.map((r) => (
          <button
            key={r.id}
            className="flex w-full items-center justify-between py-3.5 text-left transition-colors active:bg-muted/50"
            onClick={() => setSelectedId(r.id)}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{r.name}</p>
              <p className="text-xs text-muted-foreground">
                {r.servings} {r.servings === 1 ? "porzione" : "porzioni"}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(r.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </button>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa ricetta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tutti gli ingredienti associati verranno eliminati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
