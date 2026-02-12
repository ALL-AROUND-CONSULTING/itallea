import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by scale firmware — returns recipe nutrition by recipe_id
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  const url = new URL(req.url);
  const deviceId = url.searchParams.get("device_id");
  const recipeId = url.searchParams.get("recipe_id");

  if (!deviceId || !recipeId) {
    return new Response(JSON.stringify({ error: "device_id and recipe_id required" }), { status: 400, headers: corsHeaders });
  }

  const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Verify device
  const { data: device } = await serviceClient.from("devices").select("user_id, is_active").eq("hardware_device_id", deviceId).maybeSingle();
  if (!device || !device.is_active) {
    return new Response(JSON.stringify({ error: "Device not found or inactive" }), { status: 404, headers: corsHeaders });
  }

  // Get recipe (must belong to user)
  const { data: recipe } = await serviceClient.from("recipes").select("id, name, servings").eq("id", recipeId).eq("user_id", device.user_id).maybeSingle();
  if (!recipe) {
    return new Response(JSON.stringify({ error: "Recipe not found" }), { status: 404, headers: corsHeaders });
  }

  // Get ingredients
  const { data: ingredients } = await serviceClient.from("recipe_ingredients").select("product_name, grams, kcal, protein, carbs, fat").eq("recipe_id", recipeId);

  const totals = (ingredients ?? []).reduce(
    (acc, i) => ({
      kcal: acc.kcal + (i.kcal || 0),
      protein: acc.protein + (i.protein || 0),
      carbs: acc.carbs + (i.carbs || 0),
      fat: acc.fat + (i.fat || 0),
      grams: acc.grams + (i.grams || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, grams: 0 }
  );

  const perServing = {
    kcal: Math.round(totals.kcal / recipe.servings),
    protein: Math.round(totals.protein / recipe.servings * 10) / 10,
    carbs: Math.round(totals.carbs / recipe.servings * 10) / 10,
    fat: Math.round(totals.fat / recipe.servings * 10) / 10,
    grams: Math.round(totals.grams / recipe.servings),
  };

  return new Response(JSON.stringify({
    recipe_name: recipe.name,
    servings: recipe.servings,
    total: totals,
    per_serving: perServing,
    ingredients: ingredients ?? [],
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
