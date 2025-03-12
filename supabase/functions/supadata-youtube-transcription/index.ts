
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPADATA_API_KEY = Deno.env.get("SUPADATA_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getTranscript(videoId: string, useAutoCaption: boolean = false) {
  console.log(`Fetching transcript for video ID: ${videoId} using Supadata API (autoCaption: ${useAutoCaption})`);
  
  try {
    // Add auto caption parameter if requested
    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}${useAutoCaption ? '&useAutoCaption=true' : ''}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": SUPADATA_API_KEY || "",
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supadata API error (${response.status}): ${errorText}`);
      throw new Error(`Supadata API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log("Supadata API response:", JSON.stringify(data).substring(0, 200) + "...");
    
    return data;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    const body = await req.json();
    const { videoId, useAutoCaption } = body;
    
    if (!videoId) {
      return new Response(JSON.stringify({ error: "Missing videoId" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!SUPADATA_API_KEY) {
      return new Response(JSON.stringify({ error: "Supadata API key not configured" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const transcriptData = await getTranscript(videoId, useAutoCaption);

    return new Response(JSON.stringify({ 
      success: true,
      transcription: transcriptData.transcript || "", 
      metadata: transcriptData.metadata || {}
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
