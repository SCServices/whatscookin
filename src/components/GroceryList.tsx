
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface GroceryItem {
  id: string;
  name: string;
  completed: boolean;
}

const GroceryList = () => {
  const [items, setItems] = React.useState<GroceryItem[]>([]);
  const [newItem, setNewItem] = React.useState("");
  const { toast } = useToast();

  const addItem = () => {
    if (newItem.trim()) {
      const item: GroceryItem = {
        id: crypto.randomUUID(),
        name: newItem.trim(),
        completed: false,
      };
      setItems([...items, item]);
      setNewItem("");
      toast({
        title: "Item added",
        description: `${item.name} has been added to your list`,
      });
    }
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

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">My Grocery List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            className="transition-all duration-200 hover:ring-2 hover:ring-primary/20"
          />
          <Button
            onClick={addItem}
            className="min-w-[48px] min-h-[48px] bg-[#87CEEB] hover:bg-[#87CEEB]/80 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Item</span>
          </Button>
        </div>
        
        <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground animate-fade-in">
              Your list is empty. Add some items!
            </p>
          ) : (
            <ul className="space-y-2">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors duration-200 animate-fade-in"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleItem(item.id)}
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
                    onClick={() => deleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash className="h-5 w-5 text-destructive" />
                    <span className="sr-only">Delete {item.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default GroceryList;
