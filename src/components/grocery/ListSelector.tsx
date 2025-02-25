
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroceryLists } from "@/hooks/useGroceryLists";

export function ListSelector() {
  const { lists, activeListId, setActiveListId, isLoading } = useGroceryLists();

  if (isLoading) {
    return null;
  }

  return (
    <Select
      value={activeListId || undefined}
      onValueChange={setActiveListId}
    >
      <SelectTrigger className="w-full md:w-[300px] bg-white/50 backdrop-blur-sm">
        <SelectValue placeholder="Select a list" />
      </SelectTrigger>
      <SelectContent>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

