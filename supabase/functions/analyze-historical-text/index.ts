
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
}

// Helper function to create a simplified summary when API rate limits are hit
function createBasicSummary(text: string): string {
  // Calculate a simplified summary by taking the first few sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summaryLength = Math.min(3, Math.ceil(sentences.length / 3));
  return sentences.slice(0, summaryLength).join('. ') + '.';
}

// Helper function to create a fallback analysis result when API rate limits are hit
function createFallbackAnalysisResult(text: string): AnalysisResult {
  const summary = createBasicSummary(text);
  
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
    }
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const text = requestData.text;
    const action = requestData.action || "analyze"; // Default action is analyze
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Request action: ${action}`);
    console.log(`Processing text: ${text.substring(0, 100)}...`);

    // Retrieve the Gemini API key from environment variable
    const apiKey = "AIzaSyClmQFOT0ce7uTlVjGs9_qQ8zQIL0ihBuY";
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // If the action is to summarize, use a different prompt
    if (action === "summarize") {
      console.log("Summarizing text...");
      
      try {
        const summarizePrompt = `
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

        // Call the Gemini API for text summarization
        const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
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
              JSON.stringify({ summary: fallbackSummary, fallback: true }),
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

        // Return the summary
        return new Response(
          JSON.stringify({ summary }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        // If there's any error in the summarization process, use the fallback
        console.error("Error in summarization:", error);
        const fallbackSummary = createBasicSummary(text);
        return new Response(
          JSON.stringify({ summary: fallbackSummary, fallback: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // For regular analysis, continue with the existing code
    // Generate a unique identifier for each entity based on name
    const generateId = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    // The prompt for Gemini to analyze the text
    const prompt = `
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

    try {
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
        
        // Handle rate limiting specifically
        if (geminiResponse.status === 429) {
          console.log("Rate limit exceeded. Using fallback analysis.");
          const fallbackResult = createFallbackAnalysisResult(text);
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
        } else {
          console.error("Unexpected response format:", JSON.stringify(geminiData, null, 2));
          throw new Error("Unexpected response format from Gemini API");
        }
      } catch (error) {
        console.error("Error parsing Gemini response:", error);
        // Use the fallback for any parsing errors
        analysisResult = createFallbackAnalysisResult(text);
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
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
