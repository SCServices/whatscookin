
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

      // Create a map to combine ingredients with the same name but different units
      const ingredientMap = new Map<string, Ingredient[]>();
      
      data.ingredients.forEach(item => {
        const name = String(item.name).toLowerCase().trim();
        const quantity = Number(item.quantity) || 1;
        const unit = String(item.unit).toLowerCase().trim() || 'piece';
        
        if (!ingredientMap.has(name)) {
          ingredientMap.set(name, []);
        }
        ingredientMap.get(name)?.push({ name, quantity, unit });
      });

      // Convert the map back to an array, combining quantities for same units
      const ingredients: Ingredient[] = [];
      ingredientMap.forEach((items) => {
        // Group by unit
        const unitGroups = new Map<string, number>();
        items.forEach(item => {
          const currentQty = unitGroups.get(item.unit) || 0;
          unitGroups.set(item.unit, currentQty + item.quantity);
        });
        
        // Create separate ingredients for different units
        unitGroups.forEach((quantity, unit) => {
          ingredients.push({
            name: items[0].name,
            quantity,
            unit
          });
        });
      });

      console.log('Successfully parsed ingredients:', ingredients);
      return ingredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
