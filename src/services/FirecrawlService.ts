
import FirecrawlApp from '@mendable/firecrawl-js';

// Define the allowed format types
type FirecrawlFormat = 'markdown' | 'html' | 'rawHtml' | 'content' | 'links' | 'screenshot' | 'screenshot@fullPage' | 'extract' | 'json';

// Define strict types for all possible responses and configurations
interface CrawlResult {
  success: boolean;
  error?: string;
  data?: {
    html: string;
    title?: string;
    url: string;
  };
}

interface FirecrawlConfig {
  apiKey: string;
  defaultScrapeOptions: {
    formats: FirecrawlFormat[];
    cssSelector: string;
  };
  maxRetries: number;
  retryDelay: number;
}

export class FirecrawlService {
  private static instance: FirecrawlApp | null = null;
  private static config: FirecrawlConfig = {
    apiKey: '',
    defaultScrapeOptions: {
      formats: ['markdown', 'html'],
      cssSelector: 'article, main, .recipe-content, .ingredients'
    },
    maxRetries: 3,
    retryDelay: 1000
  };

  private static async getInstance(): Promise<FirecrawlApp> {
    if (!this.instance) {
      // Get the API key from Supabase secrets (it will be injected into the edge function)
      const apiKey = process.env.FIRECRAWL_API_KEY;
      if (!apiKey) {
        throw new Error('Firecrawl API key not found in environment variables.');
      }
      this.instance = new FirecrawlApp({ apiKey });
    }
    return this.instance;
  }

  private static async retry<T>(
    operation: () => Promise<T>,
    retries = this.config.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  static async crawlWebsite(url: string): Promise<CrawlResult> {
    try {
      const instance = await this.getInstance();
      
      const response = await this.retry(async () => {
        const result = await instance.crawlUrl(url, {
          limit: 1,
          scrapeOptions: {
            formats: this.config.defaultScrapeOptions.formats,
            cssSelector: this.config.defaultScrapeOptions.cssSelector
          }
        });

        if (!result.success) {
          throw new Error('Failed to crawl recipe website');
        }

        return result;
      });

      if (!response.data?.[0]) {
        return { 
          success: false, 
          error: 'No content found on the specified URL' 
        };
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

  // Method to update default configuration
  static updateConfig(newConfig: Partial<FirecrawlConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      defaultScrapeOptions: {
        ...this.config.defaultScrapeOptions,
        ...newConfig.defaultScrapeOptions
      }
    };
  }
}
