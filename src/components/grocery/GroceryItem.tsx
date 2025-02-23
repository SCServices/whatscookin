
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash } from "lucide-react";
import type { GroceryItem as GroceryItemType } from "@/types/grocery";

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const GroceryItem = ({ item, onToggle, onDelete }: GroceryItemProps) => {
  return (
    <li className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors duration-200 animate-fade-in">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="h-5 w-5"
      />
      <span
        className={`text-lg flex-1 ${
          item.completed ? "line-through text-muted-foreground" : ""
        }`}
      >
        {item.name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <Trash className="h-5 w-5 text-destructive" />
        <span className="sr-only">Delete {item.name}</span>
      </Button>
    </li>
  );
};
