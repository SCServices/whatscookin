
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroceryLists } from "@/hooks/useGroceryLists";
import { RenameListDialog } from "./RenameListDialog";

export function ListSelector() {
  const { lists, activeListId, setActiveListId, isLoading } = useGroceryLists();

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={activeListId || undefined}
        onValueChange={setActiveListId}
      >
        <SelectTrigger className="w-full md:w-[300px] bg-white/50 backdrop-blur-sm">
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent>
          {lists.map((list) => (
            <SelectItem key={list.id} value={list.id} className="flex items-center justify-between">
              {list.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activeListId && (
        <RenameListDialog
          listId={activeListId}
          currentName={lists.find(list => list.id === activeListId)?.name || ""}
        />
      )}
    </div>
  );
}
