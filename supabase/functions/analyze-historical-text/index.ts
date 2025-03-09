
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalEntity {
  id: string;
  name: string;
  type: 'person' | 'event' | 'place' | 'concept' | 'artifact';
  startDate?: string;
  endDate?: string;
  description: string;
  significance: number;
  group: string;
  relations: Array<{
    targetId: string;
    type: string;
    strength: number;
  }>;
}

interface AnalysisResult {
  entities: HistoricalEntity[];
  summary: string;
  timeline: {
    startYear: number;
    endYear: number;
    periods: Array<{
      name: string;
      startYear: number;
      endYear: number;
    }>;
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Analyzing text: ${text.substring(0, 100)}...`);

    // Generate a unique identifier for each entity based on name
    const generateId = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    // The prompt for Gemini to analyze the text
    const prompt = `
    Analyze the following historical text and extract structured information.
    Extract entities (people, events, places, concepts, artifacts) mentioned in the text.
    For each entity, determine:
    1. Name
    2. Type (person, event, place, concept, artifact)
    3. Time period (startDate and endDate if applicable, in YYYY-MM-DD format, or just the year if that's all that is known)
    4. Brief description (2-3 sentences)
    5. Significance (a number from 1-10)
    6. Group/category (e.g., politics, art, technology, philosophy)
    7. Relations to other entities (list of target entities and relationship types)

    Also provide:
    - A brief summary of the text
    - Timeline information (overall start year, end year, and key periods)

    Text to analyze:
    ${text}
    
    Format your response ONLY as a valid JSON object with the following structure, with no explanations or other text:
    {
      "entities": [
        {
          "id": "auto_generated_id",
          "name": "Name of entity",
          "type": "person/event/place/concept/artifact",
          "startDate": "YYYY-MM-DD or YYYY (optional)",
          "endDate": "YYYY-MM-DD or YYYY (optional)",
          "description": "Brief description",
          "significance": number from 1-10,
          "group": "category",
          "relations": [
            {
              "targetId": "id_of_target_entity",
              "type": "influenced/created/participated in/etc",
              "strength": number from 1-10
            }
          ]
        }
      ],
      "summary": "Brief summary of text",
      "timeline": {
        "startYear": starting year as number,
        "endYear": ending year as number,
        "periods": [
          {
            "name": "Period name",
            "startYear": starting year as number,
            "endYear": ending year as number
          }
        ]
      }
    }
    `;

    // Call the Gemini API for text analysis
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': Deno.env.get('GEMINI_API_KEY') || '',
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
          maxOutputTokens: 8192,
          responseSchema: {
            type: "object",
            properties: {
              entities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    type: { type: "string", enum: ["person", "event", "place", "concept", "artifact"] },
                    startDate: { type: "string", optional: true },
                    endDate: { type: "string", optional: true },
                    description: { type: "string" },
                    significance: { type: "number" },
                    group: { type: "string" },
                    relations: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          targetId: { type: "string" },
                          type: { type: "string" },
                          strength: { type: "number" }
                        }
                      }
                    }
                  }
                }
              },
              summary: { type: "string" },
              timeline: {
                type: "object",
                properties: {
                  startYear: { type: "number" },
                  endYear: { type: "number" },
                  periods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        startYear: { type: "number" },
                        endYear: { type: "number" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    });

    const geminiData = await geminiResponse.json();
    console.log("Gemini API response received");

    // Extract the text content and parse as JSON
    let analysisResult: AnalysisResult;
    
    try {
      if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
        const responseText = geminiData.candidates[0].content.parts[0].text;
        
        // Sometimes Gemini returns the JSON with markdown code blocks, so we need to clean it
        const cleanedText = responseText.replace(/```json|```/g, '').trim();
        
        analysisResult = JSON.parse(cleanedText);
        console.log("Successfully parsed analysis result");
        
        // Post-process: ensure all entities have unique IDs and fix relation references
        const entityMap = new Map();
        
        // First pass: generate IDs for all entities and build a map of name -> ID
        analysisResult.entities = analysisResult.entities.map(entity => {
          const id = generateId(entity.name);
          entityMap.set(entity.name.toLowerCase(), id);
          return { ...entity, id };
        });
        
        // Second pass: fix relation targetIds to reference the correct entity IDs
        analysisResult.entities = analysisResult.entities.map(entity => {
          if (entity.relations && entity.relations.length > 0) {
            entity.relations = entity.relations.map(relation => {
              // Try to find the entity ID by name if the targetId doesn't look like a proper ID
              if (!relation.targetId || !entityMap.has(relation.targetId.toLowerCase())) {
                // Try to find the entity in our map
                const fixedTargetId = entityMap.get(relation.targetId.toLowerCase());
                if (fixedTargetId) {
                  relation.targetId = fixedTargetId;
                }
              }
              return relation;
            });
          }
          return entity;
        });
      } else {
        throw new Error("Unexpected response format from Gemini API");
      }
    } catch (error) {
      console.error("Error parsing Gemini response:", error);
      throw new Error("Failed to parse Gemini API response: " + error.message);
    }

    // Return the analysis result
    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in analyze-historical-text function:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze text", 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
