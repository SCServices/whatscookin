
import { useToast } from "@/hooks/use-toast";
import type { GroceryList } from "@/types/grocery";

const MIN_LIST_NAME_LENGTH = 3;
const MAX_LIST_NAME_LENGTH = 50;
const MAX_LISTS = 20;

export const useListValidation = (lists: GroceryList[]) => {
  const { toast } = useToast();

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

  return {
    validateListName,
  };
};
