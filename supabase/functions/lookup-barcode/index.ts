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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user auth for validation
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service role client to bypass RLS for insert
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return new Response(JSON.stringify({ error: "Missing 'code' query parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Search local DB
    const { data: localProduct, error: dbError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("barcode", code)
      .maybeSingle();

    if (dbError) {
      return new Response(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (localProduct) {
      return new Response(JSON.stringify({ found: true, product: localProduct, source: "local" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Fallback to Open Food Facts
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    let offResponse: Response;
    try {
      offResponse = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}?fields=product_name,brands,nutriments,image_url`,
        { signal: controller.signal }
      );
    } catch (e) {
      clearTimeout(timeout);
      return new Response(JSON.stringify({ error: "Open Food Facts API timeout" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeout);

    const offData = await offResponse.json();

    if (offData.status !== 1 || !offData.product) {
      return new Response(JSON.stringify({ found: false }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const p = offData.product;
    const n = p.nutriments || {};

    const newProduct = {
      barcode: code,
      name: p.product_name || "Sconosciuto",
      brand: p.brands || null,
      image_url: p.image_url || null,
      source: "openfoodfacts",
      kcal_per_100g: n["energy-kcal_100g"] ?? 0,
      protein_per_100g: n["proteins_100g"] ?? 0,
      carbs_per_100g: n["carbohydrates_100g"] ?? 0,
      fat_per_100g: n["fat_100g"] ?? 0,
      fiber_per_100g: n["fiber_100g"] ?? 0,
      salt_per_100g: n["salt_100g"] ?? 0,
    };

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("products")
      .insert(newProduct)
      .select()
      .single();

    if (insertError) {
      // Return product data anyway even if insert fails
      return new Response(JSON.stringify({ found: true, product: newProduct, source: "openfoodfacts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ found: true, product: inserted, source: "openfoodfacts" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
