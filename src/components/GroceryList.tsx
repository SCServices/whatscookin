
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GroceryListLoading } from "./grocery/GroceryListLoading";
import { EmptyGroceryList } from "./grocery/EmptyGroceryList";
import { GroceryItem } from "./grocery/GroceryItem";
import { useGroceryStore } from "@/hooks/useGroceryStore";

const GroceryList = () => {
  const { items, isLoading, addItem, deleteItem, toggleItem, clearItems } = useGroceryStore();
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (addItem(newItem)) {
      setNewItem("");
    }
  };

  if (isLoading) {
    return <GroceryListLoading />;
  }

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
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            className="transition-all duration-200 hover:ring-2 hover:ring-primary/20"
          />
          <Button
            onClick={handleAddItem}
            className="min-w-[48px] min-h-[48px] bg-[#87CEEB] hover:bg-[#87CEEB]/80 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Item</span>
          </Button>
        </div>
        
        <ScrollArea className="h-[50vh] w-full rounded-md border p-4">
          {items.length === 0 ? (
            <EmptyGroceryList />
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                />
              ))}
            </ul>
          )}
        </ScrollArea>
        
        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={clearItems}
              className="text-destructive hover:text-destructive"
            >
              Clear List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroceryList;
