import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Fetch weighings for the day
    const { data: weighings, error: wError } = await supabase
      .from("weighings")
      .select("id, meal_type, kcal, protein, carbs, fat, product_name, grams")
      .eq("user_id", user.id)
      .eq("logged_at", date);

    if (wError) {
      return new Response(JSON.stringify({ error: wError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user targets
    const { data: profile } = await supabase
      .from("profiles")
      .select("target_kcal, target_protein, target_carbs, target_fat")
      .eq("id", user.id)
      .single();

    const meals = { breakfast: [], lunch: [], dinner: [], snack: [] } as Record<
      string,
      Array<{ id: string; name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number }>
    >;
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    const mealTotals = {
      breakfast: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      snack: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    } as Record<string, { kcal: number; protein: number; carbs: number; fat: number }>;

    for (const w of weighings ?? []) {
      const entry = {
        id: w.id,
        name: w.product_name,
        grams: Number(w.grams),
        kcal: Number(w.kcal),
        protein: Number(w.protein),
        carbs: Number(w.carbs),
        fat: Number(w.fat),
      };
      meals[w.meal_type].push(entry);
      totals.kcal += entry.kcal;
      totals.protein += entry.protein;
      totals.carbs += entry.carbs;
      totals.fat += entry.fat;
      mealTotals[w.meal_type].kcal += entry.kcal;
      mealTotals[w.meal_type].protein += entry.protein;
      mealTotals[w.meal_type].carbs += entry.carbs;
      mealTotals[w.meal_type].fat += entry.fat;
    }

    const targets = {
      kcal: profile?.target_kcal ?? 2000,
      protein: profile?.target_protein ?? 150,
      carbs: profile?.target_carbs ?? 200,
      fat: profile?.target_fat ?? 65,
    };

    const percentages = {
      kcal: targets.kcal > 0 ? Math.round((totals.kcal / targets.kcal) * 100) : 0,
      protein: targets.protein > 0 ? Math.round((totals.protein / targets.protein) * 100) : 0,
      carbs: targets.carbs > 0 ? Math.round((totals.carbs / targets.carbs) * 100) : 0,
      fat: targets.fat > 0 ? Math.round((totals.fat / targets.fat) * 100) : 0,
    };

    return new Response(
      JSON.stringify({ date, totals, targets, percentages, mealTotals, meals }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
