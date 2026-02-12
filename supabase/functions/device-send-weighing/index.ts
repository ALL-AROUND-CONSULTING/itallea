import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by the scale firmware — receives device_id, barcode, grams
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  const { device_id, barcode, grams, meal_type } = await req.json();

  if (!device_id || !barcode || !grams) {
    return new Response(JSON.stringify({ error: "device_id, barcode, and grams required" }), { status: 400, headers: corsHeaders });
  }

  const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Find device
  const { data: device } = await serviceClient.from("devices").select("user_id, is_active").eq("hardware_device_id", device_id).maybeSingle();
  if (!device || !device.is_active) {
    return new Response(JSON.stringify({ error: "Device not found or inactive" }), { status: 404, headers: corsHeaders });
  }

  // Find product by barcode (global first, then user)
  let product: any = null;
  let productId: string | null = null;
  let userProductId: string | null = null;

  const { data: globalProd } = await serviceClient.from("products").select("id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g").eq("barcode", barcode).maybeSingle();
  if (globalProd) {
    product = globalProd;
    productId = globalProd.id;
  } else {
    const { data: userProd } = await serviceClient.from("user_products").select("id, name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g").eq("user_id", device.user_id).eq("barcode", barcode).maybeSingle();
    if (userProd) {
      product = userProd;
      userProductId = userProd.id;
    }
  }

  if (!product) {
    return new Response(JSON.stringify({ error: "Product not found for barcode" }), { status: 404, headers: corsHeaders });
  }

  // Calculate macros
  const factor = grams / 100;
  const kcal = Math.round(product.kcal_per_100g * factor);
  const protein = Math.round(product.protein_per_100g * factor * 10) / 10;
  const carbs = Math.round(product.carbs_per_100g * factor * 10) / 10;
  const fat = Math.round(product.fat_per_100g * factor * 10) / 10;

  // Determine meal type based on time if not provided
  const mealTypeVal = meal_type || (() => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 18) return "snack";
    return "dinner";
  })();

  const { error } = await serviceClient.from("weighings").insert({
    user_id: device.user_id,
    product_id: productId,
    user_product_id: userProductId,
    product_name: product.name,
    grams,
    kcal, protein, carbs, fat,
    meal_type: mealTypeVal,
  });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  return new Response(JSON.stringify({
    success: true,
    product_name: product.name,
    grams, kcal, protein, carbs, fat,
    meal_type: mealTypeVal,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
