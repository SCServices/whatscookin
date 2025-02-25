
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";

const STORAGE_KEY = "grocery-lists";

export const useListStorage = () => {
  const [lists, setLists] = useState<GroceryList[]>([]);
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
        } else {
          // Create default list if no lists exist
          const defaultList: GroceryList = {
            id: crypto.randomUUID(),
            name: "My Grocery List",
            items: [],
            isShared: false,
            createdAt: Date.now(),
          };
          setLists([defaultList]);
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
          isShared: false,
          createdAt: Date.now(),
        };
        setLists([defaultList]);
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

  return {
    lists,
    setLists,
    isLoading,
  };
};
