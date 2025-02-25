
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export class RecipeParser {
  static async extractIngredients(html: string): Promise<Ingredient[]> {
    try {
      const response = await fetch(`${window.location.origin}/functions/v1/parse-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: html }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse recipe');
      }

      const data = await response.json();
      return data.ingredients;
    } catch (error) {
      console.error('Error parsing recipe:', error);
      throw error;
    }
  }
}
