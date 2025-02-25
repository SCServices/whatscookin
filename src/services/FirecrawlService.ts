
import FirecrawlApp from '@mendable/firecrawl-js';

interface CrawlResult {
  success: boolean;
  error?: string;
  data?: {
    html: string;
    title?: string;
    url: string;
  };
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async crawlWebsite(url: string): Promise<CrawlResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found. Please set your Firecrawl API key.' };
    }

    try {
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const response = await this.firecrawlApp.crawlUrl(url, {
        limit: 1,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          cssSelectors: ['article', 'main', '.recipe-content', '.ingredients']
        }
      });

      if (!response.success) {
        return { success: false, error: 'Failed to crawl recipe website' };
      }

      return {
        success: true,
        data: {
          html: response.data[0].html,
          title: response.data[0].title,
          url: url
        }
      };
    } catch (error) {
      console.error('Error crawling website:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API'
      };
    }
  }
}
