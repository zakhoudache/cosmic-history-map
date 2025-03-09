
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();
    
    if (!videoId) {
      throw new Error('No videoId provided');
    }
    
    console.log(`Fetching transcription for YouTube video ID: ${videoId}`);
    
    // Fetch video info to get available captions
    const videoInfoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoResponse = await fetch(videoInfoUrl);
    const videoHtml = await videoResponse.text();
    
    // Extract the captions track URL from the video page
    let captionsUrl = null;
    
    // Look for the captionTracks in the YouTube page source
    const captionsRegex = /"captionTracks":\s*(\[.*?\])/;
    const captionsMatch = videoHtml.match(captionsRegex);
    
    if (captionsMatch && captionsMatch[1]) {
      try {
        const captionTracks = JSON.parse(captionsMatch[1]);
        
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
      throw new Error('No captions found for this video');
    }
    
    // Fetch the captions XML
    console.log(`Fetching captions from URL: ${captionsUrl}`);
    const captionsResponse = await fetch(captionsUrl);
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
    console.error('Error in get-youtube-transcription function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }), 
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
