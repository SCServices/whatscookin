
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GroceryList, GroceryItem } from "@/types/grocery";

const STORAGE_KEY = "grocery-lists";
const MAX_LISTS = 20;
const MIN_LIST_NAME_LENGTH = 3;
const MAX_LIST_NAME_LENGTH = 50;

export const useGroceryLists = () => {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load lists from localStorage on component mount
  useEffect(() => {
    const loadLists = () => {
      try {
        const savedLists = localStorage.getItem(STORAGE_KEY);
        if (savedLists) {
          const parsedLists = JSON.parse(savedLists);
          if (!Array.isArray(parsedLists)) {
            throw new Error("Invalid data format in storage");
          }
          setLists(parsedLists);
          // Set active list to the most recently created list
          if (parsedLists.length > 0) {
            const mostRecent = parsedLists.reduce((prev, current) => 
              current.createdAt > prev.createdAt ? current : prev
            );
            setActiveListId(mostRecent.id);
          }
        } else {
          // Create default list if no lists exist
          const defaultList: GroceryList = {
            id: crypto.randomUUID(),
            name: "My Grocery List",
            items: [],
            createdAt: Date.now(),
          };
          setLists([defaultList]);
          setActiveListId(defaultList.id);
        }
      } catch (error) {
        console.error("Error loading lists:", error);
        toast({
          title: "Error Loading Lists",
          description: "There was a problem loading your grocery lists. Starting fresh.",
          variant: "destructive",
        });
        const defaultList: GroceryList = {
          id: crypto.randomUUID(),
          name: "My Grocery List",
          items: [],
          createdAt: Date.now(),
        };
        setLists([defaultList]);
        setActiveListId(defaultList.id);
      } finally {
        setIsLoading(false);
      }
    };

    setTimeout(loadLists, 500);
  }, [toast]);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      } catch (error) {
        console.error("Error saving lists:", error);
        toast({
          title: "Save Error",
          description: "Failed to save your changes. Your changes may be lost when you reload.",
          variant: "destructive",
        });
      }
    }
  }, [lists, isLoading, toast]);

  const validateListName = (name: string): string | null => {
    if (!name || name.trim().length < MIN_LIST_NAME_LENGTH) {
      return `List name must be at least ${MIN_LIST_NAME_LENGTH} characters`;
    }
    if (name.trim().length > MAX_LIST_NAME_LENGTH) {
      return `List name must be less than ${MAX_LIST_NAME_LENGTH} characters`;
    }
    if (lists.length >= MAX_LISTS) {
      return `Cannot create more than ${MAX_LISTS} lists`;
    }
    if (lists.some(list => list.name.toLowerCase() === name.trim().toLowerCase())) {
      return "A list with this name already exists";
    }
    return null;
  };

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

    // Don't allow deleting the last list
    if (lists.length === 1) {
      toast({
        title: "Cannot Delete List",
        description: "You must have at least one list",
        variant: "destructive",
      });
      return;
    }

    setLists(lists.filter(list => list.id !== id));
    
    // If we're deleting the active list, switch to the most recent list
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
    addItemToList,
    toggleItemInList,
    deleteItemFromList,
    clearList,
  };
};
