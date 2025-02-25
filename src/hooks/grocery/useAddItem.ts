
import { useToast } from "@/hooks/use-toast";
import type { GroceryList, GroceryItem } from "@/types/grocery";

export const useAddItem = (
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
    console.log('Inside addItemToList:', { listId, name, quantity, unit });
    
    const list = lists.find(l => l.id === listId);
    if (!list) {
      console.error('List not found:', listId);
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return false;
    }

    if (!name || name.trim().length < 2) {
      console.error('Invalid item name:', name);
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
      console.log('Updating existing item quantity:', { name: normalizedName, oldQuantity: existingItem.quantity, newQuantity: updatedQuantity });
      
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
      console.error('Invalid quantity:', quantity);
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

    console.log('Adding new item to list:', newItem);

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

  return { addItemToList };
};
