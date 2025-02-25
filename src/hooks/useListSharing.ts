
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";

export const useListSharing = (lists: GroceryList[], setLists: (lists: GroceryList[]) => void) => {
  const { toast } = useToast();

  const shareList = (id: string): string | null => {
    const list = lists.find(l => l.id === id);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return null;
    }

    if (!list.shareId) {
      const shareId = crypto.randomUUID();
      setLists(lists.map(l => 
        l.id === id ? { ...l, isShared: true, shareId } : l
      ));
      toast({
        title: "List Shared",
        description: "A sharing link has been generated for this list",
      });
      return shareId;
    }

    return list.shareId;
  };

  const unshareList = (id: string): boolean => {
    const list = lists.find(l => l.id === id);
    if (!list) {
      toast({
        title: "Error",
        description: "List not found",
        variant: "destructive",
      });
      return false;
    }

    if (!list.isShared) {
      return false;
    }

    setLists(lists.map(l => 
      l.id === id ? { ...l, isShared: false, shareId: undefined } : l
    ));
    toast({
      title: "List Unshared",
      description: "The list is no longer shared",
    });
    return true;
  };

  const getSharedList = (shareId: string): GroceryList | null => {
    return lists.find(list => list.shareId === shareId) || null;
  };

  return {
    shareList,
    unshareList,
    getSharedList,
  };
};
