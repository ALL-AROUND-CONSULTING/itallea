import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Called by the scale firmware — no user auth, uses device_id
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  const url = new URL(req.url);
  const deviceId = url.searchParams.get("device_id");
  const barcode = url.searchParams.get("barcode");

  if (!deviceId || !barcode) {
    return new Response(JSON.stringify({ error: "device_id and barcode required" }), { status: 400, headers: corsHeaders });
  }

  const serviceClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Find device and its user
  const { data: device } = await serviceClient.from("devices").select("user_id, is_active").eq("hardware_device_id", deviceId).maybeSingle();
  if (!device || !device.is_active) {
    return new Response(JSON.stringify({ error: "Device not found or inactive" }), { status: 404, headers: corsHeaders });
  }

  // Search global products first
  const { data: product } = await serviceClient.from("products").select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g, brand, image_url").eq("barcode", barcode).maybeSingle();

  if (product) {
    return new Response(JSON.stringify({ found: true, source: "global", ...product }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Search user products
  const { data: userProduct } = await serviceClient.from("user_products").select("name, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g, brand, image_url").eq("user_id", device.user_id).eq("barcode", barcode).maybeSingle();

  if (userProduct) {
    return new Response(JSON.stringify({ found: true, source: "user", ...userProduct }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ found: false, message: "Product not found" }), { status: 404, headers: corsHeaders });
});
