
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Basic HTML cleaning function to reduce tokens
function cleanHtml(html: string): string {
  // Remove scripts, styles, and comments
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove header, footer, nav, and other non-content sections
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

  // Try to find the main content area
  const mainContentMatch = cleaned.match(/<main\b[^<]*(?:(?!<\/main>)<[^<]*)*<\/main>/i) ||
    cleaned.match(/<article\b[^<]*(?:(?!<\/article>)<[^<]*)*<\/article>/i) ||
    cleaned.match(/<div[^>]*?(content|recipe)[^>]*>[\s\S]*?<\/div>/i);

  if (mainContentMatch) {
    cleaned = mainContentMatch[0];
  }

  // Remove all attributes except for basic structural ones
  cleaned = cleaned.replace(/<([a-z][a-z0-9]*)[^>]*?(class="[^"]*?recipe[^"]*")[^>]*?>/gi, '<$1 $2>') // Keep recipe-related classes
    .replace(/<([a-z][a-z0-9]*)[^>]*>/gi, '<$1>');

  return cleaned;
}

// Function to extract JSON from markdown-formatted string
function extractJsonFromMarkdown(markdownString: string): string {
  // Remove markdown code block syntax and any surrounding whitespace
  const jsonMatch = markdownString.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1];
  }
  // If no markdown format is found, return the original string
  return markdownString;
}

serve(async (req) => {
  // Handle CORS preflight requests
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
    let htmlContent = await websiteResponse.text();

    // Clean and reduce HTML content
    htmlContent = cleanHtml(htmlContent);
    console.log('Cleaned HTML length:', htmlContent.length);

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
            content: `You are a recipe content extractor. Extract the recipe content from HTML, focusing on recipe ingredients and instructions. Format with basic HTML tags where appropriate. Return as JSON: {"title": "Recipe Title", "content": "Recipe content with ingredients and instructions in HTML format"}`
          },
          {
            role: 'user',
            content: `Extract the recipe content from this HTML: ${htmlContent}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      throw new Error('Failed to process content with OpenAI');
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    // Clean up the response content before parsing
    const cleanedContent = extractJsonFromMarkdown(aiResponse.choices[0].message.content);
    console.log('Cleaned content:', cleanedContent);

    // Parse the cleaned content
    const parsedContent = JSON.parse(cleanedContent);
    console.log('Parsed content:', parsedContent);

    return new Response(
      JSON.stringify({
        success: true,
        content: parsedContent.content,
        title: parsedContent.title
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
