
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
    <li className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors duration-200 animate-fade-in">
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        className="h-5 w-5"
      />
      
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <GroceryItemModel item={item} />
          <span
            className={`text-lg flex-1 ${
              item.completed ? "line-through text-muted-foreground" : ""
            }`}
            onClick={() => setIsEditing(true)}
          >
            {item.name}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
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
      </div>

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
