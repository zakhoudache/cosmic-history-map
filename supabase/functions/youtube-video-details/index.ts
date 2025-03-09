
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback to fetch basic video details using oEmbed
async function fetchVideoDetailsViaOEmbed(videoId: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  
  const response = await fetch(oembedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch oEmbed data: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    title: data.title,
    channelTitle: data.author_name,
    thumbnailUrl: data.thumbnail_url,
    publishedAt: new Date().toISOString(), // Oembed doesn't provide publish date
  };
}

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

    console.log(`Fetching details for video: ${videoId}`);

    // Try to get video details via oEmbed (which doesn't require API key)
    const videoDetails = await fetchVideoDetailsViaOEmbed(videoId);

    return new Response(
      JSON.stringify(videoDetails),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in youtube-video-details function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch video details", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
