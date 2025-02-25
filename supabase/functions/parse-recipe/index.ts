
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
  quantity: number;
  unit: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    // Initialize OpenAI API
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Parse recipe content using GPT-4o-mini
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
            content: `You are a recipe parser that extracts ingredients from recipe HTML and converts them into structured data. 
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
        temperature: 0.3, // Lower temperature for more consistent parsing
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse recipe with OpenAI');
    }

    const data = await response.json();
    const parsedIngredients = JSON.parse(data.choices[0].message.content) as Ingredient[];

    // Normalize and deduplicate ingredients
    const normalizedIngredients = new Map<string, GroceryItem>();

    parsedIngredients.forEach((ingredient) => {
      // Normalize ingredient name (lowercase, trim)
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      if (normalizedIngredients.has(normalizedName)) {
        // Merge quantities if units match
        const existing = normalizedIngredients.get(normalizedName)!;
        if (existing.unit === ingredient.unit) {
          existing.quantity += ingredient.quantity;
        }
      } else {
        // Add new ingredient
        normalizedIngredients.set(normalizedName, {
          id: crypto.randomUUID(),
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          completed: false
        });
      }
    });

    // Convert Map back to array
    const ingredients = Array.from(normalizedIngredients.values());

    console.log('Successfully parsed ingredients:', ingredients);

    return new Response(
      JSON.stringify({ ingredients }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error parsing recipe:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to parse recipe'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
