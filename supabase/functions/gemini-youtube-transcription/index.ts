import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  console.log("Function invoked: gemini-youtube-transcription");
  
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
    
    // Fetch video info from YouTube
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`Fetching YouTube video: ${videoUrl}`);
    
    let videoResponse;
    try {
      videoResponse = await fetch(videoUrl);
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
    
    // Extract video title for better context
    let videoTitle = "";
    const titleMatch = videoHtml.match(/<title>(.*?)<\/title>/);
    if (titleMatch && titleMatch[1]) {
      videoTitle = titleMatch[1].replace(" - YouTube", "").trim();
      console.log(`Video title: ${videoTitle}`);
    }
    
    // Retrieve the Gemini API key from environment variable
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    
    // We'll use Gemini to extract transcription from the video using the YouTube URL
    const prompt = `
    I need you to extract the transcription from this YouTube video: https://www.youtube.com/watch?v=${videoId}
    
    The title of the video is: ${videoTitle}
    
    Please provide ONLY the transcription text, without any additional commentary, timestamps, or formatting.
    If you cannot access the video or extract the transcription, please just respond with "UNABLE_TO_ACCESS_TRANSCRIPTION".
    `;
    
    console.log("Calling Gemini API to extract transcription");
    
    // Call the Gemini API for text analysis
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error(`Gemini API responded with status ${geminiResponse.status}:`, errorData);
      throw new Error(`Gemini API responded with status ${geminiResponse.status}: ${errorData}`);
    }
    
    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received");
    
    // Extract the transcription from Gemini's response
    let transcription = "";
    
    try {
      if (geminiData.candidates && 
          Array.isArray(geminiData.candidates) && 
          geminiData.candidates.length > 0 && 
          geminiData.candidates[0].content && 
          geminiData.candidates[0].content.parts && 
          Array.isArray(geminiData.candidates[0].content.parts) &&
          geminiData.candidates[0].content.parts.length > 0) {
        
        transcription = geminiData.candidates[0].content.parts[0].text.trim();
        
        // Check if Gemini couldn't access the transcription
        if (transcription === "UNABLE_TO_ACCESS_TRANSCRIPTION") {
          throw new Error("Gemini could not access the video transcription");
        }
        
        console.log(`Successfully extracted transcription (${transcription.length} characters)`);
      } else {
        console.error("Unexpected response format from Gemini API:", JSON.stringify(geminiData, null, 2));
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      console.error("Error processing Gemini response:", error);
      throw new Error(`Failed to process Gemini response: ${error.message}`);
    }
    
    // Return the transcription
    return new Response(
      JSON.stringify({ 
        transcription, 
        videoId,
        title: videoTitle,
        source: "gemini"
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in gemini-youtube-transcription function:', error);
    
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
