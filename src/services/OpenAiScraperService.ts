
export class OpenAiScraperService {
  static async scrapeWebsite(url: string): Promise<{ success: boolean; error?: string; data?: { html: string; title?: string; url: string } }> {
    try {
      const response = await fetch('/functions/v1/scrape-with-openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to scrape website with OpenAI');
      }

      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Failed to extract content from website'
        };
      }

      return {
        success: true,
        data: {
          html: result.content,
          url: url,
          title: result.title
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
