
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";
import { useListValidation } from "./useListValidation";

export const useListOperations = (
  lists: GroceryList[],
  setLists: (lists: GroceryList[]) => void,
  activeListId: string | null,
  setActiveListId: (id: string | null) => void
) => {
  const { validateListName } = useListValidation(lists);
  const { toast } = useToast();

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

  return {
    createList,
    renameList,
    deleteList,
  };
};
