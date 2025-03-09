
import { supabase } from "@/integrations/supabase/client";
import { FormattedHistoricalEntity } from "@/types/supabase";

/**
 * Fetches the transcription for a YouTube video
 * @param videoId YouTube video ID
 * @returns Transcription text
 */
export const fetchYoutubeTranscription = async (videoId: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("get-youtube-transcription", {
      body: { videoId }
    });

    if (error) throw error;
    
    if (data && data.transcription) {
      return data.transcription;
    }
    
    throw new Error("No transcription data received");
  } catch (error) {
    console.error("Error fetching YouTube transcription:", error);
    throw error;
  }
};

/**
 * Analyzes a transcription to extract historical entities
 * @param transcription Text to analyze
 * @returns Array of historical entities
 */
export const analyzeTranscription = async (transcription: string): Promise<FormattedHistoricalEntity[]> => {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-historical-text", {
      body: { text: transcription }
    });

    if (error) throw error;
    
    if (data && data.entities && data.entities.length > 0) {
      return data.entities;
    }
    
    return [];
  } catch (error) {
    console.error("Error analyzing transcription:", error);
    throw error;
  }
};
