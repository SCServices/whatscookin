
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

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
            content: `You are a helpful assistant that extracts recipe ingredients from HTML content. 
            Extract all ingredients and standardize them into a list of objects with name, quantity, and unit.
            Return only a JSON array with no additional text.
            Example format:
            [
              { "name": "flour", "quantity": 2, "unit": "cup" },
              { "name": "sugar", "quantity": 0.5, "unit": "cup" },
              { "name": "eggs", "quantity": 2, "unit": "piece" }
            ]`
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const ingredients = JSON.parse(data.choices[0].message.content);

    return new Response(
      JSON.stringify({ ingredients }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to parse recipe' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
