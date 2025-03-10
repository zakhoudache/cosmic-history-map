
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const envVars = {
      GEMINI_API_KEY: Deno.env.get('GEMINI_API_KEY') ? 'Set ✅' : 'Not set ❌',
      YOUTUBE_API_KEY: Deno.env.get('YOUTUBE_API_KEY') ? 'Set ✅' : 'Not set ❌',
    };

    return new Response(
      JSON.stringify({ 
        message: 'Environmental variables status',
        variables: envVars,
        timestamp: new Date().toISOString(),
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
