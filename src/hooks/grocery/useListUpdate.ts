
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";

export const useListUpdate = (
  lists: GroceryList[],
  setLists: (lists: GroceryList[]) => void
) => {
  const { toast } = useToast();

  const updateItemQuantity = (listId: string, itemId: string, quantity: number, unit: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    setLists(lists.map(l => 
      l.id === listId
        ? {
            ...l,
            items: l.items.map(item =>
              item.id === itemId 
                ? { ...item, quantity, unit }
                : item
            ),
          }
        : l
    ));
  };

  const clearList = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return;
    }

    if (list.items.length === 0) {
      toast({
        title: "Nothing to Clear",
        description: "This list is already empty",
      });
      return;
    }

    setLists(lists.map(l => 
      l.id === listId ? { ...l, items: [] } : l
    ));

    toast({
      title: "List Cleared",
      description: `All items have been removed from ${list.name}`,
    });
  };

  return {
    updateItemQuantity,
    clearList,
  };
};
