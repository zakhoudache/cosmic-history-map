
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Access key for Supadata API - this is stored securely in Supabase Edge Function secrets
const SUPADATA_API_KEY = Deno.env.get("SUPADATA_API_KEY");

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get transcript from Supadata API
async function getTranscript(videoId: string) {
  console.log(`Fetching transcript for video ID: ${videoId} using Supadata API`);
  
  try {
    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`;
    
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

// Main API handler
serve(async (req: Request) => {
  // Handle CORS preflight
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
    const { videoId } = body;
    
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

    // Get transcript from Supadata API
    const transcriptData = await getTranscript(videoId);

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
