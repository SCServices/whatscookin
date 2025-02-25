
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useGroceryLists } from "@/hooks/useGroceryLists";

export function CreateNewListDialog() {
  const [newListName, setNewListName] = useState("");
  const { createList } = useGroceryLists();

  const handleCreateNewList = () => {
    if (createList(newListName)) {
      setNewListName("");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="bg-[#87CEEB] hover:bg-[#87CEEB]/80 transition-all duration-200 min-w-[48px] min-h-[48px] text-base"
        >
          <Plus className="mr-2" />
          Create New List
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Enter a name for your new grocery list
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="List name..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateNewList()}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              type="button"
              onClick={handleCreateNewList}
              className="bg-[#87CEEB] hover:bg-[#87CEEB]/80"
            >
              Create List
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
