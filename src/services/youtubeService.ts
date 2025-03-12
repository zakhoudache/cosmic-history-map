
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
    
    // Added try/catch for better error reporting
    try {
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
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error fetching YouTube transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching YouTube transcription: ${error.message}`);
    }
    throw new Error("Unknown error while fetching YouTube transcription");
  }
};

/**
 * Fetches transcription using the Supadata API
 * @param videoId YouTube video ID
 * @param useAutoCaption Whether to use auto-generated captions
 * @returns Transcription text
 */
export const fetchSupadataTranscription = async (videoId: string, useAutoCaption: boolean = false): Promise<string> => {
  try {
    console.log(`Calling Supadata transcription function for video ID: ${videoId} (useAutoCaption: ${useAutoCaption})`);
    
    // Added try/catch for better error reporting
    try {
      const { data, error } = await supabase.functions.invoke("supadata-youtube-transcription", {
        body: { videoId, useAutoCaption }
      });

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log("Response from Supadata transcription function:", data);
      
      if (data && data.transcription) {
        return data.transcription;
      } else if (data && data.error) {
        throw new Error(`Edge function error: ${data.error}`);
      }
      
      throw new Error("No transcription data received from Supadata API");
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error fetching Supadata transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Supadata transcription: ${error.message}`);
    }
    throw new Error("Unknown error while fetching Supadata transcription");
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
    
    // Added try/catch for better error reporting
    try {
      const { data, error } = await supabase.functions.invoke("fetch-youtube-captions", {
        body: { videoId }
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
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
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
    
    // Added try/catch for better error reporting
    try {
      const { data, error } = await supabase.functions.invoke("get-youtube-api-captions", {
        body: { videoId } // Send as a proper object, not stringified
      });

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log("Response from YouTube API captions function:", data);
      
      if (data && data.captions) {
        return data;
      } else if (data && data.error) {
        throw new Error(`Edge function error: ${data.error}`);
      }
      
      throw new Error("No caption data received from YouTube API");
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error fetching YouTube API captions:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching YouTube API captions: ${error.message}`);
    }
    throw new Error("Unknown error while fetching YouTube API captions");
  }
};

/**
 * Fetches transcription using the Gemini AI
 * @param videoId YouTube video ID
 * @returns Transcription text
 */
export const fetchGeminiTranscription = async (videoId: string): Promise<string> => {
  try {
    console.log(`Calling Gemini transcription function for video ID: ${videoId}`);
    
    // Added try/catch for better error reporting
    try {
      const { data, error } = await supabase.functions.invoke("gemini-youtube-transcription", {
        body: { videoId }
      });

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log("Response from Gemini transcription function:", data);
      
      if (data && data.transcription) {
        return data.transcription;
      } else if (data && data.error) {
        throw new Error(`Edge function error: ${data.error}`);
      }
      
      throw new Error("No transcription data received from Gemini");
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error fetching Gemini transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error fetching Gemini transcription: ${error.message}`);
    }
    throw new Error("Unknown error while fetching Gemini transcription");
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
    
    // Added try/catch for better error reporting
    try {
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
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error analyzing transcription:", error);
    if (error instanceof Error) {
      throw new Error(`Error analyzing transcription: ${error.message}`);
    }
    throw new Error("Unknown error while analyzing transcription");
  }
};

/**
 * Scrapes a YouTube video page to extract video information and captions
 * @param videoId YouTube video ID
 * @returns Object containing video information and transcription
 */
export const scrapeYoutubePage = async (videoId: string) => {
  try {
    console.log(`Scraping YouTube page for video ID: ${videoId}`);
    
    // Add detailed logging
    console.log("Supabase client initialized:", !!supabase);
    console.log("Functions API available:", !!supabase.functions);
    
    // Add try/catch for better error reporting
    try {
      const { data, error } = await supabase.functions.invoke("scrape-youtube-page", {
        body: { videoId }
      });

      if (error) {
        console.error("Supabase function error:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw new Error(`Function invocation failed: ${error.message || 'Unknown error'}`);
      }
      
      console.log("Response from scrape-youtube-page function:", data);
      
      if (data) {
        return data;
      } else {
        throw new Error("No data received from scraping function");
      }
    } catch (innerError) {
      console.error("Detailed error in function invocation:", innerError);
      throw innerError;
    }
  } catch (error) {
    console.error("Error scraping YouTube page:", error);
    if (error instanceof Error) {
      throw new Error(`Error scraping YouTube page: ${error.message}`);
    }
    throw new Error("Unknown error while scraping YouTube page");
  }
};
