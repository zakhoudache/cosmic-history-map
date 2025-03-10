
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log("Function invoked: fetch-youtube-captions");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for CORS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Log request information
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    // Check if Content-Type is application/json
    const contentType = req.headers.get('content-type');
    console.log("Content-Type:", contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error("Invalid Content-Type:", contentType);
      return new Response(
        JSON.stringify({ error: "Invalid Content-Type, expected application/json" }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Parse request body with enhanced error handling
    let requestBody;
    let videoId;
    
    try {
      const bodyText = await req.text();
      console.log("Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        console.error("Empty request body received");
        return new Response(
          JSON.stringify({ error: "Empty request body" }), 
          { 
            status: 400, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      try {
        requestBody = JSON.parse(bodyText);
        console.log("Parsed request body:", requestBody);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return new Response(
          JSON.stringify({ error: `Invalid JSON in request body: ${parseError.message}` }), 
          { 
            status: 400, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
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
      console.error("No videoId provided in request");
      return new Response(
        JSON.stringify({ error: 'No videoId provided' }), 
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    console.log(`Fetching captions for YouTube video ID: ${videoId}`);
    
    // Fetch video info to get available captions
    const videoInfoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let videoResponse;
    try {
      videoResponse = await fetch(videoInfoUrl);
      if (!videoResponse.ok) {
        throw new Error(`YouTube request failed with status ${videoResponse.status}`);
      }
    } catch (error) {
      console.error("Error fetching YouTube video page:", error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch YouTube video: ${error.message}` }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const videoHtml = await videoResponse.text();
    
    // Extract the captions track URL from the video page
    let captionsUrl = null;
    
    // Look for the captionTracks in the YouTube page source
    const captionsRegex = /"captionTracks":\s*(\[.*?\])/;
    const captionsMatch = videoHtml.match(captionsRegex);
    
    if (captionsMatch && captionsMatch[1]) {
      try {
        const captionTracks = JSON.parse(captionsMatch[1]);
        console.log(`Found ${captionTracks.length} caption tracks`);
        
        // First try to find English captions
        let englishTrack = captionTracks.find((track: any) => 
          track.languageCode === 'en' && track.kind !== 'asr'
        );
        
        // If no manual English captions, look for auto-generated ones
        if (!englishTrack) {
          englishTrack = captionTracks.find((track: any) => 
            track.languageCode === 'en'
          );
        }
        
        // If still no English captions, just take the first available track
        if (!englishTrack && captionTracks.length > 0) {
          englishTrack = captionTracks[0];
        }
        
        if (englishTrack && englishTrack.baseUrl) {
          captionsUrl = englishTrack.baseUrl;
        }
      } catch (error) {
        console.error('Error parsing caption tracks:', error);
      }
    }
    
    if (!captionsUrl) {
      console.error("No captions found for video:", videoId);
      return new Response(
        JSON.stringify({ error: 'No captions found for this video' }), 
        { 
          status: 404, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Fetch the captions XML
    console.log(`Fetching captions from URL: ${captionsUrl}`);
    let captionsResponse;
    try {
      captionsResponse = await fetch(captionsUrl);
      if (!captionsResponse.ok) {
        throw new Error(`Captions request failed with status ${captionsResponse.status}`);
      }
    } catch (error) {
      console.error("Error fetching captions:", error);
      return new Response(
        JSON.stringify({ error: `Failed to fetch captions: ${error.message}` }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const captionsXml = await captionsResponse.text();
    
    // Parse the XML to extract text
    const transcription = parseXmlCaptions(captionsXml);
    
    console.log(`Successfully extracted transcription (${transcription.length} characters)`);
    
    return new Response(
      JSON.stringify({ 
        transcription, 
        videoId 
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-youtube-captions function:', error);
    
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

// Function to parse XML captions and return a clean transcription
function parseXmlCaptions(xml: string): string {
  const textSegments: string[] = [];
  const regex = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    let text = match[1];
    
    // Replace HTML entities
    text = text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");
    
    if (text.trim()) {
      textSegments.push(text.trim());
    }
  }
  
  return textSegments.join(' ');
}
