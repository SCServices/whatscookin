
import { supabase } from "@/integrations/supabase/client";

export class OpenAiScraperService {
  static async scrapeWebsite(url: string): Promise<{ success: boolean; error?: string; data?: { html: string; title?: string; url: string } }> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-with-openai', {
        body: { url }
      });

      if (error) {
        console.error('Error from scrape-with-openai function:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (!data?.content) {
        return {
          success: false,
          error: 'No content returned from scraping'
        };
      }

      return {
        success: true,
        data: {
          html: data.content,
          url: url,
          title: data.title
        }
      };
    } catch (error) {
      console.error('Error scraping website with OpenAI:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape website with OpenAI'
      };
    }
  }
}

