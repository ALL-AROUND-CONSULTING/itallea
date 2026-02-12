import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    let query = supabase
      .from("recipes")
      .select("id, name, category, servings, notes, created_at")
      .eq("user_id", user.id)
      .order("name");

    if (category) {
      query = query.eq("category", category);
    }

    const { data } = await query;
    setRecipes(data ?? []);
    setLoading(false);
  }, [user, category]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const fetchRecipeWithIngredients = useCallback(async (recipeId: string): Promise<Recipe | null> => {
    const [recipeRes, ingredientsRes] = await Promise.all([
      supabase.from("recipes").select("*").eq("id", recipeId).single(),
      supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipeId),
    ]);

    if (!recipeRes.data) return null;

    const ingredients: RecipeIngredient[] = (ingredientsRes.data ?? []).map((i) => ({
      id: i.id,
      product_name: i.product_name,
      grams: Number(i.grams),
      kcal: Number(i.kcal),
      protein: Number(i.protein),
      carbs: Number(i.carbs),
      fat: Number(i.fat),
      product_id: i.product_id,
      user_product_id: i.user_product_id,
    }));

    const total_kcal = ingredients.reduce((s, i) => s + i.kcal, 0);
    const total_protein = ingredients.reduce((s, i) => s + i.protein, 0);
    const total_carbs = ingredients.reduce((s, i) => s + i.carbs, 0);
    const total_fat = ingredients.reduce((s, i) => s + i.fat, 0);

    return {
      ...recipeRes.data,
      servings: Number(recipeRes.data.servings),
      ingredients,
      total_kcal,
      total_protein,
      total_carbs,
      total_fat,
    };
  }, []);

  const createRecipe = useCallback(async (
    name: string,
    category: string,
    servings: number,
    notes: string | null,
    ingredients: Omit<RecipeIngredient, "id">[]
  ) => {
    if (!user) return null;

    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({ user_id: user.id, name, category, servings, notes })
      .select("id")
      .single();

    if (error || !recipe) return null;

    if (ingredients.length > 0) {
      await supabase.from("recipe_ingredients").insert(
        ingredients.map((i) => ({
          recipe_id: recipe.id,
          product_name: i.product_name,
          grams: i.grams,
          kcal: i.kcal,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat,
          product_id: i.product_id,
          user_product_id: i.user_product_id,
        }))
      );
    }

    await fetchRecipes();
    return recipe.id;
  }, [user, fetchRecipes]);

  const deleteRecipe = useCallback(async (recipeId: string) => {
    if (!user) return;
    await supabase.from("recipes").delete().eq("id", recipeId).eq("user_id", user.id);
    await fetchRecipes();
  }, [user, fetchRecipes]);

  return { recipes, loading, fetchRecipes, fetchRecipeWithIngredients, createRecipe, deleteRecipe };
}
