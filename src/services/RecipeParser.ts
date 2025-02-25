
import { supabase } from "@/integrations/supabase/client";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export class RecipeParser {
  static async extractIngredients(html: string): Promise<Ingredient[]> {
    try {
      console.log('Sending HTML content to parse-recipe function...');
      
      const { data, error } = await supabase.functions.invoke('parse-recipe', {
        body: { content: html }
      });

      if (error) {
        console.error('Error from parse-recipe function:', error);
        throw new Error(error.message);
      }

      if (!data?.ingredients) {
        throw new Error('No ingredients found in the recipe');
      }

      console.log('Parsed ingredients:', data.ingredients);
      return data.ingredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
