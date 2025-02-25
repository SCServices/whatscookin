
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { useState } from "react";
import type { GroceryItem as GroceryItemType, UnitType } from "@/types/grocery";
import { GroceryItemModel } from "./GroceryItemModel";

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number, unit: string) => void;
}

export const GroceryItem = ({ 
  item, 
  onToggle, 
  onDelete, 
  onUpdateQuantity 
}: GroceryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState(item.unit);

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseFloat(value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantity(newQuantity);
      onUpdateQuantity(item.id, newQuantity, unit);
    }
  };

  const handleUnitChange = (value: string) => {
    setUnit(value);
    onUpdateQuantity(item.id, quantity, value);
  };

  const units: UnitType[] = [
    'piece', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'cup', 'tbsp', 'tsp', 'dozen'
  ];

  return (
    <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors duration-200 animate-fade-in">
      <div className="flex items-center gap-3 min-w-[200px] flex-1">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggle(item.id)}
          className="h-5 w-5 mt-1"
        />
        <div className="flex items-center gap-2">
          <GroceryItemModel item={item} />
          <span
            className={`text-base sm:text-lg truncate ${
              item.completed ? "line-through text-muted-foreground" : ""
            }`}
            onClick={() => setIsEditing(true)}
          >
            {item.name}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto ml-8 sm:ml-0">
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="w-20 text-right"
            min="0.1"
            step="0.1"
          />
          
          <Select value={unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="shrink-0 ml-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-5 w-5" />
          <span className="sr-only">Delete {item.name}</span>
        </Button>
      </div>
    </div>
  );
};
