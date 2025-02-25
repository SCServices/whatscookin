
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";

export const useItemModification = (
  lists: GroceryList[],
  setLists: (lists: GroceryList[]) => void
) => {
  const { toast } = useToast();

  const toggleItemInList = (listId: string, itemId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return;
    }

    setLists(lists.map(l => 
      l.id === listId
        ? {
            ...l,
            items: l.items.map(item =>
              item.id === itemId 
                ? { ...item, completed: !item.completed }
                : item
            ),
          }
        : l
    ));
  };

  const deleteItemFromList = (listId: string, itemId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return;
    }

    const item = list.items.find(i => i.id === itemId);
    if (!item) {
      toast({
        title: "Error",
        description: "Item not found",
        variant: "destructive",
      });
      return;
    }

    setLists(lists.map(l => 
      l.id === listId
        ? { ...l, items: l.items.filter(i => i.id !== itemId) }
        : l
    ));

    toast({
      title: "Item Removed",
      description: `${item.name} has been removed from ${list.name}`,
    });
  };

  return {
    toggleItemInList,
    deleteItemFromList,
  };
};
