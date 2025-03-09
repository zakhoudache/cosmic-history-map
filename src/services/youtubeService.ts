
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Extract YouTube video ID from various URL formats
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

// Get video details like title, thumbnail from video ID
export const getVideoDetails = async (videoId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-video-details', {
      body: { videoId }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching video details:", error);
    toast.error("Failed to fetch video details");
    return null;
  }
};

// Fetch transcript for a YouTube video
export const fetchTranscript = async (videoId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('youtube-transcript', {
      body: { videoId }
    });
    
    if (error) throw error;
    return data?.transcript || "";
  } catch (error) {
    console.error("Error fetching transcript:", error);
    toast.error("Failed to fetch transcript. Make sure the video has captions available.");
    return "";
  }
};
