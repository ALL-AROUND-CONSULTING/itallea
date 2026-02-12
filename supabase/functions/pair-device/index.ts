import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  if (req.method === "POST") {
    const { hardware_device_id, serial_number } = await req.json();
    if (!hardware_device_id) {
      return new Response(JSON.stringify({ error: "hardware_device_id required" }), { status: 400, headers: corsHeaders });
    }

    // Check if device already paired
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: existing } = await serviceClient.from("devices").select("id, user_id").eq("hardware_device_id", hardware_device_id).maybeSingle();

    if (existing) {
      if (existing.user_id === user.id) {
        return new Response(JSON.stringify({ message: "Device already paired to your account" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Device already paired to another user" }), { status: 409, headers: corsHeaders });
    }

    const { error } = await supabase.from("devices").insert({
      hardware_device_id,
      user_id: user.id,
      serial_number: serial_number || null,
      is_active: true,
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

    return new Response(JSON.stringify({ success: true, message: "Device paired successfully" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // GET - list user's devices
  if (req.method === "GET") {
    const { data, error } = await supabase.from("devices").select("*").eq("user_id", user.id).order("paired_at", { ascending: false });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // DELETE - unpair device
  if (req.method === "DELETE") {
    const { deviceId } = await req.json();
    if (!deviceId) return new Response(JSON.stringify({ error: "deviceId required" }), { status: 400, headers: corsHeaders });
    const { error } = await supabase.from("devices").delete().eq("id", deviceId).eq("user_id", user.id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
});
