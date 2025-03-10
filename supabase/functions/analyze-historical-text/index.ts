
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalEntity {
  id: string;
  name: string;
  type: 'person' | 'event' | 'place' | 'concept' | 'period' | 'artwork' | 'document' | 'building' | 'theory' | 'invention' | 'process' | 'play';
  startDate?: string;
  endDate?: string;
  description: string;
  significance: number;
  group: string;
  domains?: string[];
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
  language?: string; // Added language detection
  confidence?: number; // Added analysis confidence score
}

// Enhanced cache mechanism with TTL (Time To Live)
const analysisCache = new Map<string, { result: AnalysisResult, timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Helper function to create a simplified summary when API rate limits are hit
function createBasicSummary(text: string): string {
  // Calculate a simplified summary by taking the first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summaryLength = Math.min(3, Math.ceil(sentences.length / 3));
  return sentences.slice(0, summaryLength).join('. ') + '.';
}

// Helper function to detect language of input text
function detectLanguage(text: string): string {
  // Simple language detection based on common words and characters
  // Arabic detection
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  // Hebrew detection
  if (/[\u0590-\u05FF]/.test(text)) {
    return 'he';
  }
  // Chinese detection
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh';
  }
  // Japanese detection
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return 'ja';
  }
  // Russian detection
  if (/[\u0400-\u04FF]/.test(text)) {
    return 'ru';
  }
  // Korean detection
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) {
    return 'ko';
  }
  
  // Default to English or check common words patterns for European languages
  // This is a simplified approach - in production, consider using a dedicated library
  return 'en';
}

// Helper function to create a fallback analysis result when API rate limits are hit
function createFallbackAnalysisResult(text: string): AnalysisResult {
  const summary = createBasicSummary(text);
  const language = detectLanguage(text);
  
  return {
    entities: [
      {
        id: "fallback_entity",
        name: "Historical Content",
        type: "concept",
        description: "This is a simplified analysis due to API rate limits. Please try again later.",
        significance: 5,
        group: "history",
        domains: ["historical"],
        relations: []
      }
    ],
    summary: summary,
    timeline: {
      startYear: 1900,
      endYear: 2000,
      periods: [
        {
          name: "20th Century",
          startYear: 1900,
          endYear: 2000
        }
      ]
    },
    language,
    confidence: 0.3 // Low confidence for fallback analysis
  };
}

// Helper function to generate a unique hash for cache keys
function generateCacheKey(text: string, action: string): string {
  let hashStr = '';
  for (let i = 0; i < text.length; i++) {
    hashStr += text.charCodeAt(i);
  }
  return `${action}_${hashStr.slice(0, 100)}`;
}

// Helper function to enrich entities with their influence scores and improved contextual descriptions
function enrichEntities(entities: HistoricalEntity[]): HistoricalEntity[] {
  return entities.map(entity => {
    // Calculate influence score based on relation strength and significance
    const relationsStrength = entity.relations.reduce((sum, rel) => sum + rel.strength, 0);
    const influenceFactor = entity.relations.length > 0 ? relationsStrength / entity.relations.length : 0;
    
    // Adjust significance based on connections
    const adjustedSignificance = Math.min(10, Math.max(1, 
      Math.round((entity.significance + influenceFactor) / 2)
    ));
    
    return {
      ...entity,
      significance: adjustedSignificance
    };
  });
}

serve(async (req: Request) => {
  console.log(`[${new Date().toISOString()}] Analyze historical text function called`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const text = requestData.text;
    const action = requestData.action || "analyze"; // Default action is analyze
    
    if (!text || typeof text !== 'string') {
      console.error("Missing or invalid text parameter");
      return new Response(
        JSON.stringify({ error: 'Text parameter is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log details about the request for monitoring and debugging
    console.log(`Request action: ${action}`);
    console.log(`Text length: ${text.length} characters`);
    console.log(`Detected language: ${detectLanguage(text)}`);
    
    // Check cache for this request
    const cacheKey = generateCacheKey(text, action);
    const cachedResult = analysisCache.get(cacheKey);
    
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL) {
      console.log("Returning cached result");
      return new Response(
        JSON.stringify(cachedResult.result),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Retrieve the Gemini API key from environment variable
    const apiKey = Deno.env.get("GEMINI_API_KEY") || "AIzaSyDgDjnV27n1kAPFuJalA3a9ShFcDa_xa9o";
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // If the action is to summarize, use a different prompt
    if (action === "summarize") {
      console.log("Summarizing text...");
      
      try {
        // Detect language and use appropriate prompt
        const detectedLanguage = detectLanguage(text);
        
        let summarizePrompt = '';
        // Select prompt template based on detected language
        if (detectedLanguage === 'ar') {
          // Arabic prompt
          summarizePrompt = `
          قم بتلخيص النص التاريخي التالي بطريقة موجزة تحافظ على المعلومات التاريخية الرئيسية.
          ركز على الحفاظ على:
          - الشخصيات والأحداث والأماكن المهمة
          - التواريخ الرئيسية والفترات الزمنية
          - المفاهيم والحركات الكبرى
          - العلاقات المهمة بين الأحداث والأشخاص

          يجب أن يكون ملخصك حوالي 25-33٪ من طول النص الأصلي مع ضمان احتوائه على
          جميع المعلومات التاريخية الرئيسية اللازمة للتحليل.

          النص المراد تلخيصه:
          ${text}
          
          قدم إجابتك كنص فقط، بدون عناوين أو تفسيرات.
          `;
        } else {
          // Default to English prompt for other languages
          summarizePrompt = `
          Summarize the following historical text concisely while preserving key historical information.
          Focus on preserving:
          - Important characters, events, and places
          - Key dates and time periods
          - Major concepts and movements
          - Important relationships between events and people

          Your summary should be about 25-33% of the original text length while ensuring it contains
          all the key historical information needed for analysis.

          Text to summarize:
          ${text}
          
          Provide your response as text only, without headings or explanations.
          `;
        }

        // Call the Gemini API for text summarization
        console.log("Calling Gemini API for summarization");
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent', {
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
                    text: summarizePrompt
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
          
          // Handle rate limit errors specifically
          if (geminiResponse.status === 429) {
            console.log("Rate limit exceeded. Using fallback summarization.");
            const fallbackSummary = createBasicSummary(text);
            return new Response(
              JSON.stringify({ summary: fallbackSummary, fallback: true, language: detectLanguage(text) }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }
          
          throw new Error(`Gemini API responded with status ${geminiResponse.status}: ${errorData}`);
        }

        const geminiData = await geminiResponse.json();
        console.log("Gemini API summary response received");
        
        // Extract the text content
        let summary = "";
        
        try {
          if (geminiData.candidates && 
              Array.isArray(geminiData.candidates) && 
              geminiData.candidates.length > 0 && 
              geminiData.candidates[0].content && 
              geminiData.candidates[0].content.parts && 
              Array.isArray(geminiData.candidates[0].content.parts) &&
              geminiData.candidates[0].content.parts.length > 0) {
            
            summary = geminiData.candidates[0].content.parts[0].text;
            console.log("Summary generated successfully", summary.substring(0, 100) + "...");
          }
        } catch (error) {
          console.error("Error extracting summary from Gemini response:", error);
          throw error;
        }

        // Return the summary with language metadata
        const result = { 
          summary, 
          language: detectedLanguage,
          confidence: 0.9 
        };
        
        // Cache the result
        analysisCache.set(cacheKey, { result, timestamp: Date.now() });
        
        return new Response(
          JSON.stringify(result),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        // If there's any error in the summarization process, use the fallback
        console.error("Error in summarization:", error);
        const fallbackSummary = createBasicSummary(text);
        const result = { 
          summary: fallbackSummary, 
          fallback: true, 
          language: detectLanguage(text),
          error: error.message 
        };
        
        return new Response(
          JSON.stringify(result),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // For regular analysis, continue with the enhanced analysis code
    // Generate a unique identifier for each entity based on name
    const generateId = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    // Detect the language of the input text
    const detectedLanguage = detectLanguage(text);
    console.log(`Detected language for analysis: ${detectedLanguage}`);
    
    // Select the appropriate prompt based on the detected language
    let prompt = '';
    let modelSelection = 'gemini-1.5-pro'; // Default model
    
    if (detectedLanguage === 'ar') {
      // Arabic prompt
      prompt = `
      قم بتحليل النص التاريخي التالي واستخراج المعلومات المهيكلة.
      استخرج الكيانات (الأشخاص، الأحداث، الأماكن، المفاهيم، القطع الأثرية) المذكورة في النص.
      لكل كيان، حدد:
      1. الاسم
      2. النوع (شخص، حدث، مكان، مفهوم، فترة، عمل فني، وثيقة، مبنى، نظرية، اختراع، عملية، مسرحية)
      3. الفترة الزمنية (تاريخ البدء والانتهاء إذا كان ذلك ممكناً، بتنسيق YYYY-MM-DD، أو السنة فقط إذا كان ذلك كل ما هو معروف)
      4. وصف موجز (2-3 جمل)
      5. الأهمية (رقم من 1-10)
      6. المجموعة/الفئة (مثل السياسة، الفن، التكنولوجيا، الفلسفة)
      7. المجالات (مصفوفة من مجالات التأثير مثل 'فني'، 'ثقافي'، 'سياسي'، 'علمي'، إلخ)
      8. العلاقات مع الكيانات الأخرى (قائمة بالكيانات المستهدفة وأنواع العلاقات)

      مهم: بالنسبة للعلاقات، تأكد من تضمين أنواع متنوعة من العلاقات مثل:
      - أثر/تأثر بـ
      - أنشأ/تم إنشاؤه بواسطة
      - شارك في/شمل
      - عارض/عارضه
      - سبق/تبع
      - يقع في/يحتوي
      - مرتبط بـ
      - متزوج من/مطلق من
      - والد/ابن
      - معلم/تلميذ
      - حليف/عدو
      - كاتب/ممثل/مخرج
      - درس/طور/اخترع
      كن محددًا بشأن نوع العلاقة بناءً على السياق.

      تأكد أيضًا من أن كل علاقة لها قيمة قوة من 1-10 تشير إلى مدى قوة الاتصال.

      قدم أيضًا:
      - ملخص موجز للنص
      - معلومات الجدول الزمني (سنة البداية الإجمالية، سنة النهاية، والفترات الرئيسية)

      النص المراد تحليله:
      ${text}
      
      صيغ إجابتك فقط ككائن JSON صالح بالهيكل التالي، بدون تفسيرات أو نص آخر:
      {
        "entities": [
          {
            "id": "auto_generated_id",
            "name": "اسم الكيان",
            "type": "person/event/place/concept/period/artwork/document/building/theory/invention/process/play",
            "startDate": "YYYY-MM-DD أو YYYY (اختياري)",
            "endDate": "YYYY-MM-DD أو YYYY (اختياري)",
            "description": "وصف موجز",
            "significance": رقم من 1-10,
            "group": "الفئة",
            "domains": ["فني", "ثقافي", "سياسي", إلخ],
            "relations": [
              {
                "targetId": "id_of_target_entity",
                "type": "أثر/أنشأ/شارك في/إلخ",
                "strength": رقم من 1-10
              }
            ]
          }
        ],
        "summary": "ملخص موجز للنص",
        "timeline": {
          "startYear": سنة البداية كرقم,
          "endYear": سنة النهاية كرقم,
          "periods": [
            {
              "name": "اسم الفترة",
              "startYear": سنة البداية كرقم,
              "endYear": سنة النهاية كرقم
            }
          ]
        }
      }
      `;
    } else {
      // Default English prompt for other languages
      prompt = `
      Analyze the following historical text and extract structured information.
      Extract entities (people, events, places, concepts, artifacts) mentioned in the text.
      For each entity, identify:
      1. Name
      2. Type (person, event, place, concept, period, artwork, document, building, theory, invention, process, play)
      3. Time period (start and end dates if possible, in YYYY-MM-DD format, or just the year if that's all that's known)
      4. Brief description (2-3 sentences)
      5. Significance (number from 1-10)
      6. Group/category (like politics, arts, technology, philosophy)
      7. Domains (array of domains of influence such as 'artistic', 'cultural', 'political', 'scientific', etc.)
      8. Relations with other entities (list of target entities and relationship types)

      Important: For relationships, make sure to include diverse types of relationships such as:
      - influenced/was influenced by
      - created/was created by
      - participated in/included
      - opposed/was opposed by
      - preceded/followed
      - located in/contains
      - associated with
      - married to/divorced from
      - parent of/child of
      - teacher of/student of
      - ally of/enemy of
      - wrote/directed/performed
      - studied/developed/invented
      Be specific about the type of relationship based on context.

      Also make sure each relationship has a strength value from 1-10 indicating how strong the connection is.

      Also provide:
      - A brief summary of the text
      - Timeline information (overall start year, end year, and major periods)

      Text to analyze:
      ${text}
      
      Format your answer only as a valid JSON object with the following structure, without explanations or other text:
      {
        "entities": [
          {
            "id": "auto_generated_id",
            "name": "entity name",
            "type": "person/event/place/concept/period/artwork/document/building/theory/invention/process/play",
            "startDate": "YYYY-MM-DD or YYYY (optional)",
            "endDate": "YYYY-MM-DD or YYYY (optional)",
            "description": "brief description",
            "significance": number from 1-10,
            "group": "category",
            "domains": ["artistic", "cultural", "political", etc],
            "relations": [
              {
                "targetId": "id_of_target_entity",
                "type": "influenced/created/participated in/etc",
                "strength": number from 1-10
              }
            ]
          }
        ],
        "summary": "brief summary of the text",
        "timeline": {
          "startYear": start year as number,
          "endYear": end year as number,
          "periods": [
            {
              "name": "period name",
              "startYear": start year as number,
              "endYear": end year as number
            }
          ]
        }
      }
      `;
    }
    
    // Use different model based on text length for optimization
    if (text.length > 8000) {
      console.log("Long text detected, using gemini-1.5-pro model");
      modelSelection = 'gemini-1.5-pro';
    } else if (text.length > 3000) {
      console.log("Medium text detected, using gemini-1.5-flash model");
      modelSelection = 'gemini-1.5-flash';
    } else {
      console.log("Short text detected, using gemini-1.5-flash-lite model");
      modelSelection = 'gemini-1.5-flash';
    }

    try {
      // Call the Gemini API for text analysis with performance monitoring
      console.log(`Calling Gemini API (${modelSelection}) for analysis`);
      const startTime = Date.now();
      
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelSelection}:generateContent`, {
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

      const endTime = Date.now();
      console.log(`Gemini API call completed in ${endTime - startTime}ms`);

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.text();
        console.error(`Gemini API responded with status ${geminiResponse.status}:`, errorData);
        
        // Handle rate limiting specifically
        if (geminiResponse.status === 429) {
          console.log("Rate limit exceeded. Using fallback analysis.");
          const fallbackResult = createFallbackAnalysisResult(text);
          
          // Cache the fallback result
          analysisCache.set(cacheKey, { result: fallbackResult, timestamp: Date.now() });
          
          return new Response(
            JSON.stringify(fallbackResult),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        throw new Error(`Gemini API responded with status ${geminiResponse.status}: ${errorData}`);
      }

      const geminiData = await geminiResponse.json();
      console.log("Gemini API response received");
    
      // Add detailed logging to debug the issue
      console.log("Gemini API response structure:", JSON.stringify(geminiData).substring(0, 200) + "...");

      // Extract the text content and parse as JSON
      let analysisResult: AnalysisResult;
    
      try {
        if (geminiData.candidates && 
            Array.isArray(geminiData.candidates) && 
            geminiData.candidates.length > 0 && 
            geminiData.candidates[0].content && 
            geminiData.candidates[0].content.parts && 
            Array.isArray(geminiData.candidates[0].content.parts) &&
            geminiData.candidates[0].content.parts.length > 0) {
        
          const responseText = geminiData.candidates[0].content.parts[0].text;
        
          // Sometimes Gemini returns the JSON with markdown code blocks, so we need to clean it
          const cleanedText = responseText.replace(/```json|```/g, '').trim();
        
          // Log the cleaned text for debugging
          console.log("Cleaned response text (first 200 chars):", cleanedText.substring(0, 200) + "...");
        
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
                // If targetId is a name rather than an ID, convert it
                if (relation.targetId && !relation.targetId.includes('_')) {
                  const targetName = relation.targetId.toLowerCase();
                  if (entityMap.has(targetName)) {
                    relation.targetId = entityMap.get(targetName);
                  } else {
                    // Try to find a similar name in the map (partial match)
                    const similarName = Array.from(entityMap.keys()).find(name => 
                      targetName.includes(name) || name.includes(targetName)
                    );
                    if (similarName) {
                      relation.targetId = entityMap.get(similarName);
                    }
                  }
                }
              
                // Ensure we have a relationship type
                if (!relation.type || relation.type.trim() === '') {
                  relation.type = 'associated with';
                }
              
                // Ensure we have a strength value
                if (!relation.strength || relation.strength < 1 || relation.strength > 10) {
                  relation.strength = 5; // Default to medium strength
                }
              
                return relation;
              }).filter(relation => relation.targetId); // Remove relations with missing targetIds
            }
            return entity;
          });
        
          // Add bi-directional relationships if missing
          const newEntities = [...analysisResult.entities];
          analysisResult.entities.forEach(entity => {
            if (entity.relations && entity.relations.length > 0) {
              entity.relations.forEach(relation => {
                const targetEntity = newEntities.find(e => e.id === relation.targetId);
                if (targetEntity) {
                  // Check if the target doesn't have a relationship back to this entity
                  const hasReverseRelation = targetEntity.relations?.some(r => r.targetId === entity.id);
                  if (!hasReverseRelation && targetEntity.relations) {
                    // Create a reverse relationship type
                    let reverseType = 'associated with';
                    switch (relation.type) {
                      case 'created': reverseType = 'was created by'; break;
                      case 'influenced': reverseType = 'was influenced by'; break;
                      case 'married to': reverseType = 'married to'; break; // Bidirectional
                      case 'teacher of': reverseType = 'student of'; break;
                      case 'student of': reverseType = 'teacher of'; break;
                      case 'allied with': reverseType = 'allied with'; break; // Bidirectional
                      case 'parent of': reverseType = 'child of'; break;
                      case 'child of': reverseType = 'parent of'; break;
                      case 'preceded': reverseType = 'followed'; break;
                      case 'followed': reverseType = 'preceded'; break;
                      case 'located in': reverseType = 'contains'; break;
                      case 'contains': reverseType = 'located in'; break;
                      case 'opposed': reverseType = 'was opposed by'; break;
                      case 'was opposed by': reverseType = 'opposed'; break;
                      case 'wrote': reverseType = 'was written by'; break;
                      case 'directed': reverseType = 'was directed by'; break;
                      case 'performed': reverseType = 'was performed by'; break;
                      case 'invented': reverseType = 'was invented by'; break;
                      case 'developed': reverseType = 'was developed by'; break;
                      default: reverseType = 'associated with';
                    }
                  
                    // Add the reverse relationship
                    targetEntity.relations.push({
                      targetId: entity.id,
                      type: reverseType,
                      strength: relation.strength
                    });
                  }
                }
              });
            }
          });
          
          // Add language detection and confidence score
          analysisResult.language = detectedLanguage;
          analysisResult.confidence = 0.85;
          
          // Enrich entities with additional insights
          analysisResult.entities = enrichEntities(analysisResult.entities);
          
          // Cache the successful result
          analysisCache.set(cacheKey, { result: analysisResult, timestamp: Date.now() });
          
        } else {
          console.error("Unexpected response format:", JSON.stringify(geminiData, null, 2));
          throw new Error("Unexpected response format from Gemini API");
        }
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        // Use the fallback for any parsing errors
        analysisResult = createFallbackAnalysisResult(text);
        
        // Still cache the fallback result
        analysisCache.set(cacheKey, { result: analysisResult, timestamp: Date.now() });
      }

      // Return the analysis result
      return new Response(
        JSON.stringify(analysisResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error) {
      console.error("Error in API call:", error);
      
      // If any error occurs during analysis, use the fallback
      const fallbackResult = createFallbackAnalysisResult(text);
      
      // Cache even the fallback for performance
      analysisCache.set(cacheKey, { result: fallbackResult, timestamp: Date.now() });
      
      return new Response(
        JSON.stringify(fallbackResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error("Error in analyze-historical-text function:", error.message);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze text", 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
