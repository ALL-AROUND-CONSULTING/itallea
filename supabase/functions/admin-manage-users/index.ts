import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // Verify caller is admin
  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

  const url = new URL(req.url);
  const targetUserId = url.searchParams.get("userId");

  // GET - list users OR get user weighings
  if (req.method === "GET") {
    // If userId param is provided, return that user's weighings
    if (targetUserId) {
      const { data, error } = await adminClient
        .from("weighings")
        .select("*")
        .eq("user_id", targetUserId)
        .order("logged_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: { users }, error } = await adminClient.auth.admin.listUsers({ perPage: 100 });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    // Get profiles for extra info
    const { data: profiles } = await adminClient.from("profiles").select("id, first_name, last_name, onboarding_completed, created_at");

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
    const result = (users ?? []).map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      first_name: profileMap.get(u.id)?.first_name ?? null,
      last_name: profileMap.get(u.id)?.last_name ?? null,
      onboarding_completed: profileMap.get(u.id)?.onboarding_completed ?? false,
    }));

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // DELETE - delete a user
  if (req.method === "DELETE") {
    const { userId } = await req.json();
    if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });

    // Delete user data cascade
    for (const table of ["recipe_ingredients", "recipes", "weighings", "water_logs", "weight_logs", "user_products", "user_roles", "product_submissions", "profiles"]) {
      const col = table === "profiles" ? "id" : "user_id";
      if (table === "recipe_ingredients") {
        const { data: recipes } = await adminClient.from("recipes").select("id").eq("user_id", userId);
        if (recipes?.length) {
          await adminClient.from("recipe_ingredients").delete().in("recipe_id", recipes.map((r: any) => r.id));
        }
        continue;
      }
      await adminClient.from(table).delete().eq(col, userId);
    }
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
});
