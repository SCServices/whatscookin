
import { useToast } from "@/hooks/use-toast";
import type { GroceryList, GroceryItem } from "@/types/grocery";

export const useItemOperations = (
  lists: GroceryList[],
  setLists: (lists: GroceryList[]) => void
) => {
  const { toast } = useToast();

  const addItemToList = (
    listId: string, 
    name: string, 
    quantity: number = 1, 
    unit: string = 'piece'
  ): boolean => {
    const list = lists.find(l => l.id === listId);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return false;
    }

    if (!name || name.trim().length < 2) {
      toast({
        title: "Cannot Add Item",
        description: "Item name must be at least 2 characters",
        variant: "destructive",
      });
      return false;
    }

    const normalizedName = name.trim().toLowerCase();
    
    // Check if the item exists with the same name AND unit
    const existingItem = list.items.find(item => 
      item.name.toLowerCase() === normalizedName && 
      item.unit.toLowerCase() === unit.toLowerCase()
    );

    if (existingItem) {
      // Update quantity instead of adding new item
      const updatedQuantity = existingItem.quantity + quantity;
      setLists(lists.map(l => 
        l.id === listId 
          ? {
              ...l,
              items: l.items.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: updatedQuantity }
                  : item
              ),
            }
          : l
      ));

      toast({
        title: "Item Updated",
        description: `Updated ${normalizedName} to ${updatedQuantity} ${unit}${updatedQuantity > 1 && unit === 'piece' ? 's' : ''}`,
      });
      return true;
    }

    if (quantity <= 0) {
      toast({
        title: "Cannot Add Item",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: normalizedName,
      completed: false,
      quantity,
      unit,
    };

    setLists(lists.map(l => 
      l.id === listId 
        ? { ...l, items: [...l.items, newItem] }
        : l
    ));

    toast({
      title: "Item Added",
      description: `${newItem.quantity} ${newItem.unit}${newItem.quantity > 1 && newItem.unit === 'piece' ? 's' : ''} of ${newItem.name} added to ${list.name}`,
    });
    return true;
  };

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
    addItemToList,
    toggleItemInList,
    deleteItemFromList,
    updateItemQuantity,
    clearList,
  };
};

