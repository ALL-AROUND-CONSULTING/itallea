import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

  const { image_base64, image_url } = await req.json();
  if (!image_base64 && !image_url) {
    return new Response(JSON.stringify({ error: "image_base64 or image_url required" }), { status: 400, headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: corsHeaders });
  }

  try {
    const imageContent = image_base64
      ? { type: "image_url" as const, image_url: { url: `data:image/jpeg;base64,${image_base64}` } }
      : { type: "image_url" as const, image_url: { url: image_url } };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition label OCR assistant. Extract nutritional values from food label images.
Return ONLY a JSON object with these fields (all numbers per 100g):
{
  "name": "product name if visible, otherwise empty string",
  "brand": "brand if visible, otherwise empty string",
  "kcal_per_100g": number,
  "protein_per_100g": number,
  "carbs_per_100g": number,
  "fat_per_100g": number,
  "fiber_per_100g": number,
  "salt_per_100g": number
}
If a value is not visible, use 0. Always return per 100g values. If the label shows per serving, calculate per 100g. Return ONLY valid JSON, no markdown, no explanation.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the nutritional values from this food label image." },
              imageContent,
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_nutrition",
              description: "Extract nutritional values from a food label",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  brand: { type: "string" },
                  kcal_per_100g: { type: "number" },
                  protein_per_100g: { type: "number" },
                  carbs_per_100g: { type: "number" },
                  fat_per_100g: { type: "number" },
                  fiber_per_100g: { type: "number" },
                  salt_per_100g: { type: "number" },
                },
                required: ["kcal_per_100g", "protein_per_100g", "carbs_per_100g", "fat_per_100g"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_nutrition" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later" }), { status: 429, headers: corsHeaders });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: corsHeaders });
      }
      const text = await response.text();
      console.error("AI error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI processing failed" }), { status: 500, headers: corsHeaders });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const nutrition = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({
        success: true,
        nutrition: {
          name: nutrition.name || "",
          brand: nutrition.brand || "",
          kcal_per_100g: Number(nutrition.kcal_per_100g) || 0,
          protein_per_100g: Number(nutrition.protein_per_100g) || 0,
          carbs_per_100g: Number(nutrition.carbs_per_100g) || 0,
          fat_per_100g: Number(nutrition.fat_per_100g) || 0,
          fiber_per_100g: Number(nutrition.fiber_per_100g) || 0,
          salt_per_100g: Number(nutrition.salt_per_100g) || 0,
        },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fallback: try parsing content as JSON
    const content = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const nutrition = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify({ success: true, nutrition }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Could not extract nutrition data" }), { status: 422, headers: corsHeaders });
  } catch (e) {
    console.error("OCR error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: corsHeaders });
  }
});
