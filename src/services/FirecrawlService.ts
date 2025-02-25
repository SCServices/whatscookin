
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
    cssSelector?: string; // Updated to use cssSelector which is the correct parameter
  };
  maxRetries: number;
  retryDelay: number;
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static instance: FirecrawlApp | null = null;
  private static config: FirecrawlConfig = {
    apiKey: '',
    defaultScrapeOptions: {
      formats: ['markdown', 'html'],
      cssSelector: 'article, main, .recipe-content, .ingredients' // Use cssSelector instead of selector
    },
    maxRetries: 3,
    retryDelay: 1000
  };

  private static async getInstance(): Promise<FirecrawlApp> {
    if (!this.instance) {
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error('API key not found. Please set your Firecrawl API key.');
      }
      this.instance = new FirecrawlApp({ apiKey });
    }
    return this.instance;
  }

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    // Reset instance to force new initialization with new API key
    this.instance = null;
    this.config.apiKey = apiKey;
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
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
            cssSelector: this.config.defaultScrapeOptions.cssSelector // Using cssSelector instead of selector
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
