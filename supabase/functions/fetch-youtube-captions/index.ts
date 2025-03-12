
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
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
    console.log("Request method:", req.method);
    
    // Parse request body
    let requestBody;
    let videoId;
    let useAutoCaption = true; // Default to using auto-generated captions
    
    try {
      requestBody = await req.json();
      videoId = requestBody.videoId;
      // Check if the request specifies useAutoCaption
      if (requestBody.useAutoCaption !== undefined) {
        useAutoCaption = requestBody.useAutoCaption;
      }
      console.log(`Parsed videoId: ${videoId}, useAutoCaption: ${useAutoCaption}`);
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
    
    console.log(`Fetching captions for YouTube video ID: ${videoId}, preferring ${useAutoCaption ? 'auto-generated' : 'manual'} captions`);
    
    // Fetch video info to get available captions
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    let videoResponse;
    try {
      console.log(`Fetching YouTube page: ${videoUrl}`);
      videoResponse = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
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
    console.log(`Fetched YouTube page, HTML length: ${videoHtml.length}`);
    
    // Extract the captions track URL from the video page
    let captionUrl = null;
    let captionLanguage = null;
    let captionIsAuto = false;
    
    // Look for the captionTracks in the YouTube page source
    const captionsRegex = /"captionTracks":\s*(\[.*?\])/;
    const captionsMatch = videoHtml.match(captionsRegex);
    
    if (captionsMatch && captionsMatch[1]) {
      try {
        const captionTracks = JSON.parse(captionsMatch[1]);
        console.log(`Found ${captionTracks.length} caption tracks`);
        
        // Log all available tracks for debugging
        captionTracks.forEach((track: any, index: number) => {
          console.log(`Track ${index}: ${track.name?.simpleText || 'Unnamed'} (${track.languageCode}) ${track.kind === 'asr' ? '(Auto-generated)' : ''}`);
        });
        
        // Selection logic based on useAutoCaption preference
        let selectedTrack = null;
        
        if (useAutoCaption) {
          // First try to find English auto-generated captions
          selectedTrack = captionTracks.find((track: any) => 
            track.languageCode === 'en' && track.kind === 'asr'
          );
          
          // If no English auto captions, try any auto-generated captions
          if (!selectedTrack) {
            selectedTrack = captionTracks.find((track: any) => track.kind === 'asr');
          }
          
          // If still no auto captions, fall back to manual captions
          if (!selectedTrack) {
            console.log("No auto-generated captions found, falling back to manual captions");
            selectedTrack = captionTracks.find((track: any) => track.languageCode === 'en');
            
            // If no English manual captions, take the first available track
            if (!selectedTrack && captionTracks.length > 0) {
              selectedTrack = captionTracks[0];
            }
          }
        } else {
          // Prefer manual captions
          // First try to find English manual captions
          selectedTrack = captionTracks.find((track: any) => 
            track.languageCode === 'en' && track.kind !== 'asr'
          );
          
          // If no English manual captions, try any manual captions
          if (!selectedTrack) {
            selectedTrack = captionTracks.find((track: any) => track.kind !== 'asr');
          }
          
          // If still no manual captions, fall back to auto-generated
          if (!selectedTrack) {
            console.log("No manual captions found, falling back to auto-generated captions");
            selectedTrack = captionTracks.find((track: any) => track.languageCode === 'en' && track.kind === 'asr');
            
            // If no English auto captions, take the first available track
            if (!selectedTrack && captionTracks.length > 0) {
              selectedTrack = captionTracks[0];
            }
          }
        }
        
        if (selectedTrack) {
          captionUrl = selectedTrack.baseUrl;
          captionLanguage = selectedTrack.languageCode;
          captionIsAuto = selectedTrack.kind === 'asr';
          console.log(`Selected caption track: ${selectedTrack.name?.simpleText || 'Unnamed'} (${captionLanguage}) ${captionIsAuto ? '(Auto-generated)' : '(Manual)'}`);
        }
      } catch (error) {
        console.error('Error parsing caption tracks:', error);
      }
    }
    
    if (!captionUrl) {
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
    console.log(`Fetching captions from URL: ${captionUrl}`);
    let captionsResponse;
    try {
      captionsResponse = await fetch(captionUrl);
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
        videoId,
        language: captionLanguage,
        isAutoGenerated: captionIsAuto,
        captionType: captionIsAuto ? 'auto-generated' : 'manual'
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
    
    // Remove remaining XML tags if any
    text = text.replace(/<[^>]*>/g, '');
    
    if (text.trim()) {
      textSegments.push(text.trim());
    }
  }
  
  return textSegments.join(' ');
}
