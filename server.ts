// server.ts - YouTube Caption Extractor Server
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import cors from 'cors';
import bodyParser from 'body-parser';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Types
interface CaptionRequest {
  videoId: string;
  useAutoCaption?: boolean;
}

interface CaptionResponse {
  transcription: string;
}

interface ErrorResponse {
  error: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
}

interface CaptionTrack {
  baseUrl: string;
  name: string;
  languageCode: string;
  kind?: string;
}

/**
 * Endpoint to fetch YouTube captions
 */
app.post('/api/extract-captions', async (req: Request<{}, {}, CaptionRequest>, res: Response<CaptionResponse | ErrorResponse>) => {
  try {
    const { videoId, useAutoCaption = true } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: "Missing videoId parameter" });
    }
    
    console.log(`Fetching captions for video ID: ${videoId} (useAutoCaption: ${useAutoCaption})`);
    
    // Attempt to get captions
    const transcription = await fetchYouTubeCaptions(videoId, useAutoCaption);
    
    return res.json({ transcription });
  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to fetch captions" 
    });
  }
});

/**
 * Simple endpoint to check if the server is running
 */
app.get('/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Fetches YouTube captions for a given video ID
 * @param {string} videoId - The YouTube video ID
 * @param {boolean} useAutoCaption - Whether to prioritize auto-generated captions
 * @returns {Promise<string>} - The caption text
 */
async function fetchYouTubeCaptions(videoId: string, useAutoCaption: boolean = true): Promise<string> {
  try {
    // First, get the video page to extract caption track information
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const response = await fetch(videoUrl);
    const html = await response.text();
    
    // Extract caption tracks data from the page
    const captionTracks = extractCaptionTracks(html);
    
    if (!captionTracks || captionTracks.length === 0) {
      throw new Error("No caption tracks found for this video");
    }
    
    console.log(`Found ${captionTracks.length} caption tracks`);
    
    // Choose the appropriate caption track
    let selectedTrack: CaptionTrack | undefined;
    
    if (useAutoCaption) {
      // Look for English auto-generated captions first
      selectedTrack = captionTracks.find(
        track => track.languageCode === 'en' && track.kind === 'asr'
      );
    }
    
    // If no auto captions or not using auto captions, try regular English captions
    if (!selectedTrack) {
      selectedTrack = captionTracks.find(
        track => track.languageCode === 'en' && (!track.kind || track.kind !== 'asr')
      );
    }
    
    // If no English captions of the preferred type, try any English captions
    if (!selectedTrack) {
      selectedTrack = captionTracks.find(
        track => track.languageCode === 'en'
      );
    }
    
    // If still no track, use the first available track
    if (!selectedTrack && captionTracks.length > 0) {
      selectedTrack = captionTracks[0];
    }
    
    if (!selectedTrack) {
      throw new Error("Could not find a suitable caption track");
    }
    
    console.log(`Selected caption track: ${selectedTrack.name}`);
    
    // Fetch the actual caption data
    const captionData = await fetch(selectedTrack.baseUrl);
    const captionXml = await captionData.text();
    
    // Parse the XML to extract caption text
    const plainText = parseXmlCaptions(captionXml);
    
    return plainText;
  } catch (error) {
    console.error("Error fetching captions:", error);
    throw new Error(`Failed to fetch captions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts caption track information from the YouTube page HTML
 * @param {string} html - The HTML content of the YouTube page
 * @returns {Array<CaptionTrack>} - Array of caption track objects
 */
function extractCaptionTracks(html: string): CaptionTrack[] {
  try {
    // Look for the ytInitialPlayerResponse object in the page
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    
    if (!playerResponseMatch) {
      throw new Error("Could not find player response data");
    }
    
    // Parse the JSON data
    const playerResponse = JSON.parse(playerResponseMatch[1]);
    
    // Extract caption tracks
    if (!playerResponse.captions || 
        !playerResponse.captions.playerCaptionsTracklistRenderer || 
        !playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks) {
      return [];
    }
    
    return playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks as CaptionTrack[];
  } catch (error) {
    console.error("Error extracting caption tracks:", error);
    return [];
  }
}

/**
 * Parses XML caption data into plain text
 * @param {string} xml - The XML caption data
 * @returns {string} - Plain text captions
 */
function parseXmlCaptions(xml: string): string {
  try {
    const $ = cheerio.load(xml, { xmlMode: true });
    let plainText = "";
    
    $('text').each((_, element) => {
      const text = $(element).text()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      plainText += text + "\n";
    });
    
    return plainText;
  } catch (error) {
    console.error("Error parsing XML captions:", error);
    throw new Error(`Failed to parse captions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`YouTube Caption Extractor server running on port ${PORT}`);
});