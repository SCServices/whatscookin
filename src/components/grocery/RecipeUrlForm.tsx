
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { FirecrawlService } from '@/services/FirecrawlService';
import { RecipeParser } from '@/services/RecipeParser';

interface RecipeUrlFormProps {
  onIngredientsExtracted: (ingredients: Array<{ name: string; quantity: number; unit: string }>) => void;
}

export const RecipeUrlForm = ({ onIngredientsExtracted }: RecipeUrlFormProps) => {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress(20);

    try {
      // Start web scraping
      const scrapeResult = await FirecrawlService.crawlWebsite(url);
      setProgress(50);

      if (!scrapeResult.success || !scrapeResult.data) {
        throw new Error(scrapeResult.error || 'Failed to scrape recipe');
      }

      // Parse recipe content
      const ingredients = await RecipeParser.extractIngredients(scrapeResult.data.html);
      setProgress(100);

      if (ingredients.length === 0) {
        throw new Error('No ingredients found in the recipe');
      }

      onIngredientsExtracted(ingredients);
      toast({
        title: "Success",
        description: `Found ${ingredients.length} ingredients in the recipe`,
      });
    } catch (error) {
      console.error('Error processing recipe:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process recipe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setProgress(0);
      setUrl('');
    }
  };

  return (
    <Card className="w-full p-4 mb-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste recipe URL here..."
            className="w-full"
            required
          />
        </div>
        {isLoading && (
          <Progress value={progress} className="w-full" />
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing Recipe..." : "Add Recipe to List"}
        </Button>
      </form>
    </Card>
  );
};
