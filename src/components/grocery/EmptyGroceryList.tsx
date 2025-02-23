
import { ShoppingBasket } from "lucide-react";

export const EmptyGroceryList = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="relative mb-4">
        <ShoppingBasket className="w-16 h-16 text-[#87CEEB]" />
        <div className="absolute -bottom-2 w-16 h-2 bg-[#87CEEB]/20 blur-sm rounded-full" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your grocery list is empty</h3>
      <p className="text-muted-foreground max-w-[300px]">
        Start adding items to your list using the input field above. Your items will be saved automatically.
      </p>
    </div>
  );
};
