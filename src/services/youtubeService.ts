
import { supabase } from "@/integrations/supabase/client";
import { FormattedHistoricalEntity } from "@/types/supabase";

/**
 * Fetches the transcription for a YouTube video
 * @param videoId YouTube video ID
 * @returns Transcription text
 */
export const fetchYoutubeTranscription = async (videoId: string): Promise<string> => {
  try {
    console.log(`Calling edge function for video ID: ${videoId}`);
    
    // Add more detailed logging
    console.log("Supabase client initialized:", !!supabase);
    console.log("Functions API available:", !!supabase.functions);
    
    const { data, error } = await supabase.functions.invoke("get-youtube-transcription", {
      body: JSON.stringify({ videoId })
    });

    if (error) {
      console.error("Supabase function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log("Response from edge function:", data);
    
    if (data && data.transcription) {
      return data.transcription;
    } else if (data && data.error) {
      throw new Error(`Edge function error: ${data.error}`);
    }
    
    throw new Error("No transcription data received");
  } catch (error) {
    console.error("Error fetching YouTube transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching YouTube transcription: ${error.message}`);
    }
    throw new Error("Unknown error while fetching YouTube transcription");
  }
};

/**
 * Fetches the transcription for a YouTube video using the alternative captions endpoint
 * @param videoId YouTube video ID
 * @returns Transcription text
 */
export const fetchYoutubeCaptions = async (videoId: string): Promise<string> => {
  try {
    console.log(`Calling the new captions edge function for video ID: ${videoId}`);
    
    // Add detailed logging
    console.log("Supabase client initialized:", !!supabase);
    console.log("Functions API available:", !!supabase.functions);
    
    const { data, error } = await supabase.functions.invoke("fetch-youtube-captions", {
      body: JSON.stringify({ videoId })
    });

    if (error) {
      console.error("Supabase function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log("Response from captions edge function:", data);
    
    if (data && data.transcription) {
      return data.transcription;
    } else if (data && data.error) {
      throw new Error(`Edge function error: ${data.error}`);
    }
    
    throw new Error("No caption data received");
  } catch (error) {
    console.error("Error fetching YouTube captions:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching YouTube captions: ${error.message}`);
    }
    throw new Error("Unknown error while fetching YouTube captions");
  }
};

/**
 * Fetches captions using the YouTube API method
 * @param videoId YouTube video ID
 * @returns Information about available caption tracks
 */
export const fetchYoutubeApiCaptions = async (videoId: string) => {
  try {
    console.log(`Calling YouTube API captions function for video ID: ${videoId}`);
    
    const { data, error } = await supabase.functions.invoke("get-youtube-api-captions", {
      body: JSON.stringify({ videoId })
    });

    if (error) {
      console.error("Supabase function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log("Response from YouTube API captions function:", data);
    
    if (data && data.captionTracks) {
      return data;
    } else if (data && data.error) {
      throw new Error(`Edge function error: ${data.error}`);
    }
    
    throw new Error("No caption data received from YouTube API");
  } catch (error) {
    console.error("Error fetching YouTube API captions:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching YouTube API captions: ${error.message}`);
    }
    throw new Error("Unknown error while fetching YouTube API captions");
  }
};

/**
 * Analyzes a transcription to extract historical entities
 * @param transcription Text to analyze
 * @returns Array of historical entities
 */
export const analyzeTranscription = async (transcription: string): Promise<FormattedHistoricalEntity[]> => {
  try {
    console.log(`Analyzing transcription (${transcription.length} characters)`);
    
    const { data, error } = await supabase.functions.invoke("analyze-historical-text", {
      body: JSON.stringify({ text: transcription })
    });

    if (error) {
      console.error("Supabase function error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log("Analysis response:", data);
    
    if (data && data.entities && data.entities.length > 0) {
      return data.entities;
    } else if (data && data.error) {
      throw new Error(`Edge function error: ${data.error}`);
    }
    
    return [];
  } catch (error) {
    console.error("Error analyzing transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error analyzing transcription: ${error.message}`);
    }
    throw new Error("Unknown error while analyzing transcription");
  }
};
