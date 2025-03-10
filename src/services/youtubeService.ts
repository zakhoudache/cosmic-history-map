
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
    console.log("Trying to invoke function with URL:", supabase.functions.url);
    
    const { data, error } = await supabase.functions.invoke("get-youtube-transcription", {
      body: { videoId }
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
 * Analyzes a transcription to extract historical entities
 * @param transcription Text to analyze
 * @returns Array of historical entities
 */
export const analyzeTranscription = async (transcription: string): Promise<FormattedHistoricalEntity[]> => {
  try {
    console.log(`Analyzing transcription (${transcription.length} characters)`);
    
    const { data, error } = await supabase.functions.invoke("analyze-historical-text", {
      body: { text: transcription }
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
