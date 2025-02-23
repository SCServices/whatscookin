
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import useGroceryStore from "@/hooks/useGroceryStore";
import { Plus } from "lucide-react";

export function CreateNewListDialog() {
  const { toast } = useToast();
  const clearItems = useGroceryStore((state) => state.clearItems);

  const handleCreateNewList = () => {
    clearItems();
    toast({
      title: "List cleared",
      description: "Your grocery list has been cleared. Start adding new items!",
    });
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
            Are you sure you want to clear the current list and start a new one?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateNewList}
            className="bg-[#87CEEB] hover:bg-[#87CEEB]/80"
          >
            Create New List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
