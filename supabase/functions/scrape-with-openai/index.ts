
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // First, fetch the webpage content
    const websiteResponse = await fetch(url);
    const htmlContent = await websiteResponse.text();

    // Use OpenAI to extract relevant content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a webpage content extractor. Extract the main content from HTML, focusing on recipe content if present. Format with basic HTML tags where appropriate. Extract:
            1. Page title
            2. Main content (recipe ingredients and instructions if present)
            Return as JSON: {"title": "string", "content": "string"}`
          },
          {
            role: 'user',
            content: `Extract content from this HTML: ${htmlContent}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process content with OpenAI');
    }

    const aiResponse = await response.json();
    const parsedContent = JSON.parse(aiResponse.choices[0].message.content);

    return new Response(
      JSON.stringify({
        success: true,
        ...parsedContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-with-openai function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to scrape website' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
