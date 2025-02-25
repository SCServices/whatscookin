
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to extract JSON from markdown-formatted string if needed
function extractJsonFromMarkdown(markdownString: string): string {
  const jsonMatch = markdownString.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1];
  }
  return markdownString;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Received HTML content:', content);

    // Make request to OpenAI API
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
            content: `You are an ingredient parser. Extract ingredients from recipe HTML and convert them to structured data. 
            For each ingredient, identify:
            1. The ingredient name (normalized and simplified)
            2. The quantity (as a number)
            3. The unit of measurement (standardized to: piece, kg, g, lb, oz, l, ml, cup, tbsp, tsp, dozen)
            
            Return ONLY a JSON array of ingredients in this exact format, nothing else:
            [{"name": "ingredient", "quantity": number, "unit": "unit"}]
            
            Important rules:
            - Always use lowercase for names and units
            - Convert fractional amounts to decimals
            - Normalize units to the closest standard unit
            - If no unit is specified, use "piece" as default
            - If no quantity is specified, use 1 as default`
          },
          {
            role: 'user',
            content: `Parse these ingredients from the following HTML: ${content}`
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

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Clean up the response content
    const cleanedContent = extractJsonFromMarkdown(data.choices[0].message.content);
    console.log('Cleaned content:', cleanedContent);

    // Parse the ingredients array
    const ingredients = JSON.parse(cleanedContent);
    console.log('Parsed ingredients:', ingredients);

    // Validate the structure of each ingredient
    const validatedIngredients = ingredients.map((ingredient: any) => ({
      name: String(ingredient.name).toLowerCase().trim(),
      quantity: Number(ingredient.quantity) || 1,
      unit: String(ingredient.unit).toLowerCase().trim() || 'piece'
    }));

    return new Response(JSON.stringify({ ingredients: validatedIngredients }), {
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
