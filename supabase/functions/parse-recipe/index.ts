
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extract ingredients from recipe text. Return a JSON array of objects with 'name', 'quantity', and 'unit' properties. 
            Standardize units to: piece, kg, g, lb, oz, l, ml, cup, tbsp, tsp, or dozen.
            Example: [{"name": "apple", "quantity": 2, "unit": "piece"}]`
          },
          {
            role: 'user',
            content
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    let ingredients = [];

    try {
      ingredients = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Failed to parse ingredients from recipe');
    }

    return new Response(JSON.stringify({ ingredients }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in parse-recipe function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
