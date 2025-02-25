
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

      // First, normalize all ingredients
      const normalizedIngredients = data.ingredients.map(item => ({
        name: String(item.name).toLowerCase().trim(),
        quantity: Number(item.quantity) || 1,
        unit: String(item.unit).toLowerCase().trim() || 'piece'
      }));

      // Group ingredients by name and unit
      const groupedIngredients = new Map<string, Map<string, number>>();
      
      normalizedIngredients.forEach(item => {
        if (!groupedIngredients.has(item.name)) {
          groupedIngredients.set(item.name, new Map());
        }
        const unitMap = groupedIngredients.get(item.name)!;
        const currentQty = unitMap.get(item.unit) || 0;
        unitMap.set(item.unit, currentQty + item.quantity);
      });

      // Convert back to array format
      const finalIngredients: Ingredient[] = [];
      groupedIngredients.forEach((unitMap, name) => {
        unitMap.forEach((quantity, unit) => {
          finalIngredients.push({
            name,
            quantity,
            unit
          });
        });
      });

      console.log('Successfully parsed ingredients:', finalIngredients);
      return finalIngredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
