import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// User submits a nutrition correction for a product
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { barcode, name, brand, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g, image_url } = await req.json();

  if (!name) return new Response(JSON.stringify({ error: "name required" }), { status: 400, headers: corsHeaders });

  const { error } = await supabase.from("product_submissions").insert({
    user_id: user.id,
    barcode: barcode || null,
    name,
    brand: brand || null,
    kcal_per_100g: kcal_per_100g ?? 0,
    protein_per_100g: protein_per_100g ?? 0,
    carbs_per_100g: carbs_per_100g ?? 0,
    fat_per_100g: fat_per_100g ?? 0,
    fiber_per_100g: fiber_per_100g ?? 0,
    salt_per_100g: salt_per_100g ?? 0,
    image_url: image_url || null,
    status: "pending",
  });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  return new Response(JSON.stringify({ success: true, message: "Submission received, pending admin review" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
