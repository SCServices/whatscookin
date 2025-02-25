
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useListStorage } from "./useListStorage";
import { useListValidation } from "./useListValidation";
import { useListSharing } from "./useListSharing";
import type { GroceryItem, GroceryList } from "@/types/grocery";

export const useGroceryLists = () => {
  const { lists, setLists, isLoading } = useListStorage();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const { validateListName } = useListValidation(lists);
  const { shareList, unshareList, getSharedList } = useListSharing(lists, setLists);
  const { toast } = useToast();

  // Set initial active list
  if (!activeListId && lists.length > 0 && !isLoading) {
    const mostRecent = lists.reduce((prev, current) => 
      current.createdAt > prev.createdAt ? current : prev
    );
    setActiveListId(mostRecent.id);
  }

  const createList = (name: string): boolean => {
    const error = validateListName(name);
    if (error) {
      toast({
        title: "Cannot Create List",
        description: error,
        variant: "destructive",
      });
      return false;
    }

    const newList: GroceryList = {
      id: crypto.randomUUID(),
      name: name.trim(),
      items: [],
      isShared: false,
      createdAt: Date.now(),
    };

    setLists([...lists, newList]);
    setActiveListId(newList.id);
    toast({
      title: "List Created",
      description: `${newList.name} has been created`,
    });
    return true;
  };

  const renameList = (id: string, newName: string): boolean => {
    const list = lists.find(l => l.id === id);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return false;
    }

    if (newName.trim() === list.name) {
      return false;
    }

    const error = validateListName(newName);
    if (error) {
      toast({
        title: "Cannot Rename List",
        description: error,
        variant: "destructive",
      });
      return false;
    }

    setLists(lists.map(list => 
      list.id === id ? { ...list, name: newName.trim() } : list
    ));
    toast({
      title: "List Renamed",
      description: `List has been renamed to ${newName.trim()}`,
    });
    return true;
  };

  const deleteList = (id: string) => {
    const list = lists.find(l => l.id === id);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return;
    }

    if (lists.length === 1) {
      toast({
        title: "Cannot Delete List",
        description: "You must have at least one list",
        variant: "destructive",
      });
      return;
    }

    setLists(lists.filter(list => list.id !== id));
    
    if (id === activeListId) {
      const remainingLists = lists.filter(list => list.id !== id);
      const mostRecent = remainingLists.reduce((prev, current) => 
        current.createdAt > prev.createdAt ? current : prev
      );
      setActiveListId(mostRecent.id);
    }

    toast({
      title: "List Deleted",
      description: `${list.name} has been deleted`,
    });
  };

  const getActiveList = () => {
    return lists.find(list => list.id === activeListId) || null;
  };

  const addItemToList = (listId: string, name: string): boolean => {
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

    if (list.items.some(item => item.name.toLowerCase() === name.trim().toLowerCase())) {
      toast({
        title: "Cannot Add Item",
        description: "This item is already in the list",
        variant: "destructive",
      });
      return false;
    }

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      completed: false,
    };

    setLists(lists.map(l => 
      l.id === listId 
        ? { ...l, items: [...l.items, newItem] }
        : l
    ));

    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to ${list.name}`,
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
  };
};
