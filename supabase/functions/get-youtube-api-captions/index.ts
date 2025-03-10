
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  console.log("Function invoked: get-youtube-api-captions");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for CORS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    console.log("Request method:", req.method);
    
    // Parse request body
    let requestBody;
    let videoId;
    
    try {
      requestBody = await req.json();
      videoId = requestBody.videoId;
      console.log("Parsed videoId:", videoId);
    } catch (e) {
      console.error("Error reading request body:", e);
      return new Response(
        JSON.stringify({ error: `Error reading request body: ${e.message}` }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Video ID is required" }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 400,
        }
      );
    }

    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      console.error("YouTube API key not configured");
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 500,
        }
      );
    }

    console.log(`Fetching captions using YouTube API for video ID: ${videoId}`);
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?videoId=${videoId}&key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ 
          error: `YouTube API error: ${response.status}`,
          details: errorText 
        }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: response.status,
        }
      );
    }
    
    const data = await response.json();
    console.log("YouTube API response received:", data);

    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No transcriptions found" }), 
        {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 404,
        }
      );
    }
    
    // Since we can't directly download captions from the API without auth,
    // let's still return the basic info
    return new Response(
      JSON.stringify({ 
        captionTracks: data.items,
        videoId,
        message: "YouTube API requires OAuth2 for downloading captions content" 
      }), 
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-youtube-api-captions function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
