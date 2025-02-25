
import { supabase } from "@/integrations/supabase/client";

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export class RecipeParser {
  static async extractIngredients(html: string): Promise<Ingredient[]> {
    try {
      const { data, error } = await supabase.functions.invoke('parse-recipe', {
        body: { content: html }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.ingredients) {
        throw new Error('No ingredients found in the recipe');
      }

      return data.ingredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
