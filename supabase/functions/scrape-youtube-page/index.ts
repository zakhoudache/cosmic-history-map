
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  console.log("Function invoked: scrape-youtube-page");
  
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
    
    console.log(`Scraping YouTube page for video ID: ${videoId}`);
    
    // Fetch video info from YouTube
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`Fetching YouTube video: ${videoUrl}`);
    
    let videoResponse;
    try {
      console.log("Attempting to fetch YouTube page...");
      videoResponse = await fetch(videoUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        }
      });
      console.log(`YouTube response status: ${videoResponse.status}`);
      
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
    
    // Extract video metadata
    const result = {
      videoId,
      title: extractVideoTitle(videoHtml),
      description: extractVideoDescription(videoHtml),
      transcription: extractTranscriptionData(videoHtml),
      captionTracks: extractCaptionTracks(videoHtml),
      uploadDate: extractUploadDate(videoHtml),
      viewCount: extractViewCount(videoHtml),
      channelName: extractChannelName(videoHtml),
      channelId: extractChannelId(videoHtml)
    };
    
    console.log("Extracted video information:", {
      videoId: result.videoId,
      title: result.title,
      hasTranscription: !!result.transcription,
      captionTracksCount: result.captionTracks ? result.captionTracks.length : 0,
      uploadDate: result.uploadDate,
      channelName: result.channelName
    });
    
    return new Response(
      JSON.stringify(result), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in scrape-youtube-page function:', error);
    
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

// Helper functions to extract data from the YouTube page HTML

function extractVideoTitle(html: string): string {
  const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
  return titleMatch ? titleMatch[1] : '';
}

function extractVideoDescription(html: string): string {
  const descriptionRegex = /"description":\s*{\s*"simpleText":\s*"([^"]*)"/;
  const match = html.match(descriptionRegex);
  if (match && match[1]) {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  return '';
}

function extractTranscriptionData(html: string): string {
  // This is a more complex extraction that would require parsing the transcript
  // For now, we'll just check if transcripts are available
  const hasTranscriptRegex = /"hasTranscript":\s*true/;
  if (hasTranscriptRegex.test(html)) {
    // Extract transcript content when available
    const transcriptRegex = /"transcriptCueGroupRenderer":\s*{[\s\S]*?"cues":\s*(\[[\s\S]*?\])/;
    const match = html.match(transcriptRegex);
    if (match && match[1]) {
      try {
        const cuesJson = JSON.parse(match[1]);
        return cuesJson.map((cue: any) => {
          if (cue.transcriptCueRenderer && cue.transcriptCueRenderer.cue) {
            return cue.transcriptCueRenderer.cue.simpleText || '';
          }
          return '';
        }).join(' ');
      } catch (e) {
        console.error('Error parsing transcript JSON:', e);
      }
    }
  }
  return '';
}

function extractCaptionTracks(html: string): any[] {
  const captionsRegex = /"captionTracks":\s*(\[.*?\])/;
  const captionsMatch = html.match(captionsRegex);
  
  if (captionsMatch && captionsMatch[1]) {
    try {
      const captionTracks = JSON.parse(captionsMatch[1]);
      return captionTracks.map((track: any) => ({
        languageCode: track.languageCode,
        name: track.name ? track.name.simpleText : '',
        baseUrl: track.baseUrl,
        isAutoGenerated: track.kind === 'asr'
      }));
    } catch (e) {
      console.error('Error parsing caption tracks:', e);
      return [];
    }
  }
  return [];
}

function extractUploadDate(html: string): string {
  const uploadDateRegex = /"uploadDate":\s*"([^"]*)"/;
  const match = html.match(uploadDateRegex);
  return match ? match[1] : '';
}

function extractViewCount(html: string): string {
  const viewCountRegex = /"viewCount":\s*"([^"]*)"/;
  const match = html.match(viewCountRegex);
  return match ? match[1] : '';
}

function extractChannelName(html: string): string {
  const channelNameRegex = /"ownerChannelName":\s*"([^"]*)"/;
  const match = html.match(channelNameRegex);
  return match ? match[1] : '';
}

function extractChannelId(html: string): string {
  const channelIdRegex = /"externalChannelId":\s*"([^"]*)"/;
  const match = html.match(channelIdRegex);
  return match ? match[1] : '';
}
