
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Fetching transcript for video: ${videoId}`);

    // Fetch the transcript from YouTube via API
    const response = await fetch(`https://youtubetranscript.com/?server_vid=${videoId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process the transcript data
    let transcriptText = "";
    
    if (data && data.length > 0) {
      // Combine all transcript parts into one text
      transcriptText = data
        .map((item: { text: string }) => item.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }

    return new Response(
      JSON.stringify({ transcript: transcriptText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in youtube-transcript function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch transcript", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
