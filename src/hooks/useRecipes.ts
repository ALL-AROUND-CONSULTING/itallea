import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export type RecipeIngredient = {
  id: string;
  product_name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  product_id: string | null;
  user_product_id: string | null;
};

export type Recipe = {
  id: string;
  name: string;
  category: string;
  servings: number;
  notes: string | null;
  created_at: string;
  ingredients?: RecipeIngredient[];
  total_kcal?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
};

export function useRecipes(category?: string) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const body: any = {};
      if (category) body.recipe_categories_id = category;
      const data = await apiClient<any>("/api/app/recipes/get", {
        method: "POST",
        body,
      });
      const records = Array.isArray(data) ? data : data.records ?? [];
      setRecipes(records.map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category ?? r.recipe_categories_id,
        servings: Number(r.servings ?? 1),
        notes: r.notes ?? null,
        created_at: r.created_at,
      })));
    } catch {
      setRecipes([]);
    }
    setLoading(false);
  }, [user, category]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const fetchRecipeWithIngredients = useCallback(async (recipeId: string): Promise<Recipe | null> => {
    try {
      const data = await apiClient<any>("/api/app/recipes/get-detail", {
        method: "POST",
        body: { id: recipeId },
      });
      const r = data.record ?? data;
      if (!r) return null;

      const ingredients: RecipeIngredient[] = (r.ingredients ?? []).map((i: any) => ({
        id: i.id,
        product_name: i.product_name ?? i.name,
        grams: Number(i.grams),
        kcal: Number(i.kcal ?? 0),
        protein: Number(i.protein ?? 0),
        carbs: Number(i.carbs ?? 0),
        fat: Number(i.fat ?? 0),
        product_id: i.product_id ?? null,
        user_product_id: i.user_product_id ?? null,
      }));

      return {
        id: r.id,
        name: r.name,
        category: r.category ?? r.recipe_categories_id,
        servings: Number(r.servings ?? 1),
        notes: r.notes ?? null,
        created_at: r.created_at,
        ingredients,
        total_kcal: ingredients.reduce((s, i) => s + i.kcal, 0),
        total_protein: ingredients.reduce((s, i) => s + i.protein, 0),
        total_carbs: ingredients.reduce((s, i) => s + i.carbs, 0),
        total_fat: ingredients.reduce((s, i) => s + i.fat, 0),
      };
    } catch {
      return null;
    }
  }, []);

  const createRecipe = useCallback(async (
    name: string,
    category: string,
    servings: number,
    notes: string | null,
    ingredients: Omit<RecipeIngredient, "id">[]
  ) => {
    if (!user) return null;
    try {
      const data = await apiClient<any>("/api/app/recipes/add", {
        method: "POST",
        body: {
          name,
          recipe_categories_id: category,
          notes,
          ingredients: ingredients.map((i) => ({
            product_id: i.product_id,
            grams: i.grams,
          })),
        },
      });
      await fetchRecipes();
      return data.id ?? data.record?.id ?? null;
    } catch {
      return null;
    }
  }, [user, fetchRecipes]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!user) return;
    try {
      await apiClient("/api/app/recipes/delete", {
        method: "POST",
        body: { id: recipeId },
      });
      await fetchRecipes();
    } catch {}
  }, [user, fetchRecipes]);

  return { recipes, loading, fetchRecipes, fetchRecipeWithIngredients, createRecipe, deleteRecipe };
}
