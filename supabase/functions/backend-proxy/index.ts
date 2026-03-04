/**
 * Edge function proxy — forwards requests to the software house backend
 * to bypass CORS restrictions from the browser.
 *
 * Usage:  POST /functions/v1/backend-proxy
 * Body:   { "path": "/oauth/token/", "method": "POST", "body": {...}, "headers": {...} }
 *
 * The function forwards the request to BACKEND_BASE_URL + path and returns
 * the response as-is, wrapped with proper CORS headers.
 */

const BACKEND_BASE_URL = "https://italea.test.b4web.biz";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path, method = "POST", body, headers: extraHeaders = {} } = await req.json();

    if (!path || typeof path !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'path' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build upstream request
    const upstreamUrl = `${BACKEND_BASE_URL}${path}`;
    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    const fetchOptions: RequestInit = {
      method,
      headers: upstreamHeaders,
    };

    if (body && method !== "GET" && method !== "HEAD") {
      fetchOptions.body = JSON.stringify(body);
    }

    const upstreamRes = await fetch(upstreamUrl, fetchOptions);
    const responseBody = await upstreamRes.text();

    return new Response(responseBody, {
      status: upstreamRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstreamRes.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown proxy error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
