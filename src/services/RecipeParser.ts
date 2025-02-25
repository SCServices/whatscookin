
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

      if (!data?.ingredients || !Array.isArray(data.ingredients)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid ingredients data returned from parser');
      }

      // Validate and normalize each ingredient
      const ingredients = data.ingredients.map(item => ({
        name: String(item.name).toLowerCase().trim(),
        quantity: Number(item.quantity) || 1,
        unit: String(item.unit).toLowerCase().trim() || 'piece'
      }));

      console.log('Successfully parsed ingredients:', ingredients);
      return ingredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
