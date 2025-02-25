
import { useState } from "react";
import { useListStorage } from "./useListStorage";
import { useListSharing } from "./useListSharing";
import { useListOperations } from "./useListOperations";
import { useItemOperations } from "./useItemOperations";
import type { GroceryList } from "@/types/grocery";

export const useGroceryLists = () => {
  const { lists, setLists, isLoading } = useListStorage();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  
  // Initialize hooks
  const { shareList, unshareList, getSharedList } = useListSharing(lists, setLists);
  const { createList, renameList, deleteList } = useListOperations(lists, setLists, activeListId, setActiveListId);
  const { 
    addItemToList, 
    toggleItemInList, 
    deleteItemFromList, 
    updateItemQuantity, 
    clearList 
  } = useItemOperations(lists, setLists);

  // Set initial active list
  if (!activeListId && lists.length > 0 && !isLoading) {
    const mostRecent = lists.reduce((prev, current) => 
      current.createdAt > prev.createdAt ? current : prev
    );
    setActiveListId(mostRecent.id);
  }

  const getActiveList = () => {
    return lists.find(list => list.id === activeListId) || null;
  };

  return {
    lists,
    activeListId,
    isLoading,
    setActiveListId,
    getActiveList,
    createList,
    renameList,
    deleteList,
    shareList,
    unshareList,
    getSharedList,
    addItemToList,
    toggleItemInList,
    deleteItemFromList,
    clearList,
    updateItemQuantity,
  };
};
