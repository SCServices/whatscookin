
import { useAddItem } from "./grocery/useAddItem";
import { useItemModification } from "./grocery/useItemModification";
import { useListUpdate } from "./grocery/useListUpdate";
import type { GroceryList } from "@/types/grocery";

export const useItemOperations = (
  lists: GroceryList[],
  setLists: (lists: GroceryList[]) => void
) => {
  const { addItemToList } = useAddItem(lists, setLists);
  const { toggleItemInList, deleteItemFromList } = useItemModification(lists, setLists);
  const { updateItemQuantity, clearList } = useListUpdate(lists, setLists);

  return {
    addItemToList,
    toggleItemInList,
    deleteItemFromList,
    updateItemQuantity,
    clearList,
  };
};
