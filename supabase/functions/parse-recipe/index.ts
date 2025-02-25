
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    
    console.log('Parsing recipe ingredients from HTML content...');

    // Call OpenAI API to parse ingredients
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
            content: `You are a recipe ingredient parser. Extract ingredients from recipe HTML and convert them to structured data. 
            For each ingredient, identify:
            1. The ingredient name (normalized and simplified)
            2. The quantity (as a number)
            3. The unit of measurement (standardized to: piece, kg, g, lb, oz, l, ml, cup, tbsp, tsp, dozen)
            Return only a JSON array of ingredients in the format: [{"name": string, "quantity": number, "unit": string}]`
          },
          {
            role: 'user',
            content: `Parse these ingredients from the following HTML and convert to structured data: ${content}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse recipe with OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    // Extract and normalize the ingredients from OpenAI's response
    const rawIngredients = JSON.parse(data.choices[0].message.content);
    
    // Normalize the ingredients
    const ingredients = rawIngredients.map(ingredient => ({
      name: ingredient.name.toLowerCase().trim(),
      quantity: parseFloat(ingredient.quantity) || 1,
      unit: ingredient.unit.toLowerCase()
    }));

    console.log('Parsed ingredients:', ingredients);

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

