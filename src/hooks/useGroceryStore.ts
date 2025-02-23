
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GroceryItem } from "@/types/grocery";

const STORAGE_KEY = "grocery-list-items";
const MAX_ITEMS = 100; // Reasonable limit for a grocery list
const MIN_ITEM_LENGTH = 2;
const MAX_ITEM_LENGTH = 50;

export const useGroceryStore = () => {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load items from localStorage on component mount
  useEffect(() => {
    const loadItems = () => {
      try {
        const savedItems = localStorage.getItem(STORAGE_KEY);
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          if (!Array.isArray(parsedItems)) {
            throw new Error("Invalid data format in storage");
          }
          setItems(parsedItems);
        }
      } catch (error) {
        console.error("Error loading items:", error);
        toast({
          title: "Error Loading List",
          description: "There was a problem loading your grocery list. Starting with an empty list.",
          variant: "destructive",
        });
        // Reset to empty list on error
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate a brief loading state for better UX
    setTimeout(loadItems, 500);
  }, [toast]);

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error("Error saving items:", error);
        toast({
          title: "Save Error",
          description: "Failed to save your changes. Your changes may be lost when you reload.",
          variant: "destructive",
        });
      }
    }
  }, [items, isLoading, toast]);

  const validateItem = (name: string): string | null => {
    if (!name || name.trim().length < MIN_ITEM_LENGTH) {
      return `Item name must be at least ${MIN_ITEM_LENGTH} characters`;
    }
    if (name.trim().length > MAX_ITEM_LENGTH) {
      return `Item name must be less than ${MAX_ITEM_LENGTH} characters`;
    }
    if (items.length >= MAX_ITEMS) {
      return `Cannot add more than ${MAX_ITEMS} items to the list`;
    }
    if (items.some(item => item.name.toLowerCase() === name.trim().toLowerCase())) {
      return "This item is already in your list";
    }
    return null;
  };

  const addItem = (name: string): boolean => {
    const error = validateItem(name);
    if (error) {
      toast({
        title: "Cannot Add Item",
        description: error,
        variant: "destructive",
      });
      return false;
    }

    const item: GroceryItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      completed: false,
    };

    setItems([...items, item]);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your list`,
    });
    return true;
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) {
      toast({
        title: "Error",
        description: "Item not found in the list",
        variant: "destructive",
      });
      return;
    }

    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Item Removed",
      description: `${item.name} has been removed from your list`,
    });
  };

  const toggleItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) {
      toast({
        title: "Error",
        description: "Item not found in the list",
        variant: "destructive",
      });
      return;
    }

    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const clearItems = () => {
    if (items.length === 0) {
      toast({
        title: "Nothing to Clear",
        description: "Your grocery list is already empty",
      });
      return;
    }

    setItems([]);
    toast({
      title: "List Cleared",
      description: "Your grocery list has been cleared",
    });
  };

  return {
    items,
    isLoading,
    addItem,
    deleteItem,
    toggleItem,
    clearItems,
  };
};

