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

  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await anonClient.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (!isAdmin) return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });

  const url = new URL(req.url);

  // GET - list submissions or products
  if (req.method === "GET") {
    const type = url.searchParams.get("type") ?? "submissions";
    
    if (type === "submissions") {
      const { data, error } = await adminClient.from("product_submissions").select("*").order("created_at", { ascending: false });
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Global products
    const { data, error } = await adminClient.from("products").select("*").order("name");
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // POST - create global product or approve submission
  if (req.method === "POST") {
    const body = await req.json();

    // Approve a submission
    if (body.action === "approve" && body.submissionId) {
      const { data: sub, error: fetchErr } = await adminClient.from("product_submissions").select("*").eq("id", body.submissionId).single();
      if (fetchErr || !sub) return new Response(JSON.stringify({ error: "Submission not found" }), { status: 404, headers: corsHeaders });

      const { error: insertErr } = await adminClient.from("products").insert({
        barcode: sub.barcode, name: sub.name, brand: sub.brand,
        kcal_per_100g: sub.kcal_per_100g, protein_per_100g: sub.protein_per_100g,
        carbs_per_100g: sub.carbs_per_100g, fat_per_100g: sub.fat_per_100g,
        fiber_per_100g: sub.fiber_per_100g, salt_per_100g: sub.salt_per_100g,
        image_url: sub.image_url, source: "user_submission",
      });
      if (insertErr) return new Response(JSON.stringify({ error: insertErr.message }), { status: 500, headers: corsHeaders });

      await adminClient.from("product_submissions").update({ status: "approved", reviewed_by: user.id }).eq("id", body.submissionId);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Reject a submission
    if (body.action === "reject" && body.submissionId) {
      await adminClient.from("product_submissions").update({ status: "rejected", reviewed_by: user.id }).eq("id", body.submissionId);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create new global product
    const { name, barcode, brand, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g, image_url } = body;
    if (!name) return new Response(JSON.stringify({ error: "name required" }), { status: 400, headers: corsHeaders });

    const { error } = await adminClient.from("products").insert({
      name, barcode: barcode || null, brand: brand || null,
      kcal_per_100g: kcal_per_100g ?? 0, protein_per_100g: protein_per_100g ?? 0,
      carbs_per_100g: carbs_per_100g ?? 0, fat_per_100g: fat_per_100g ?? 0,
      fiber_per_100g: fiber_per_100g ?? 0, salt_per_100g: salt_per_100g ?? 0,
      image_url: image_url || null, source: "admin",
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // DELETE - delete a global product
  if (req.method === "DELETE") {
    const { productId } = await req.json();
    if (!productId) return new Response(JSON.stringify({ error: "productId required" }), { status: 400, headers: corsHeaders });
    const { error } = await adminClient.from("products").delete().eq("id", productId);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
});
