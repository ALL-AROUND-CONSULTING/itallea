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

    const userId = user.id;

    // Fetch all user data in parallel
    const [profileRes, weighingsRes, waterRes, weightRes, productsRes, recipesRes] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase.from("weighings").select("*").eq("user_id", userId).order("logged_at", { ascending: false }),
        supabase.from("water_logs").select("*").eq("user_id", userId).order("logged_at", { ascending: false }),
        supabase.from("weight_logs").select("*").eq("user_id", userId).order("logged_at", { ascending: false }),
        supabase.from("user_products").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("recipes").select("*, recipe_ingredients(*)").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_email: user.email,
      profile: profileRes.data,
      weighings: weighingsRes.data ?? [],
      water_logs: waterRes.data ?? [],
      weight_logs: weightRes.data ?? [],
      user_products: productsRes.data ?? [],
      recipes: recipesRes.data ?? [],
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="ital-lea-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
