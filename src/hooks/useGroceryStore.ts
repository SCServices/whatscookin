
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GroceryItem } from "@/types/grocery";

const STORAGE_KEY = "grocery-list-items";

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
          setItems(JSON.parse(savedItems));
        }
      } catch (error) {
        console.error("Error loading items:", error);
        toast({
          title: "Error",
          description: "Failed to load your grocery list",
          variant: "destructive",
        });
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
          title: "Error",
          description: "Failed to save your changes",
          variant: "destructive",
        });
      }
    }
  }, [items, isLoading, toast]);

  const addItem = (name: string) => {
    if (name.trim()) {
      const item: GroceryItem = {
        id: crypto.randomUUID(),
        name: name.trim(),
        completed: false,
      };
      setItems([...items, item]);
      toast({
        title: "Item added",
        description: `${item.name} has been added to your list`,
      });
      return true;
    }
    return false;
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems(items.filter((item) => item.id !== id));
    if (item) {
      toast({
        title: "Item removed",
        description: `${item.name} has been removed from your list`,
      });
    }
  };

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const clearItems = () => {
    setItems([]);
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
