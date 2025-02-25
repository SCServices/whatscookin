
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Share2, Copy, X } from "lucide-react";
import { useGroceryLists } from "@/hooks/useGroceryLists";

export function ShareListDialog({ listId }: { listId: string }) {
  const [open, setOpen] = useState(false);
  const { lists, shareList, unshareList } = useGroceryLists();
  const list = lists.find(l => l.id === listId);
  
  if (!list) return null;

  const handleShare = () => {
    shareList(listId);
  };

  const handleUnshare = () => {
    if (unshareList(listId)) {
      setOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (list.shareId) {
      const url = `${window.location.origin}/shared/${list.shareId}`;
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${list.isShared ? 'text-blue-500' : ''}`}
        >
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share list</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share List</DialogTitle>
          <DialogDescription>
            {list.isShared 
              ? "Your list is currently shared. Anyone with the link can view it."
              : "Share this list with others. They'll be able to view it but not modify it."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {list.isShared && list.shareId ? (
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/shared/${list.shareId}`}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
          {list.isShared ? (
            <Button variant="destructive" onClick={handleUnshare}>
              Stop Sharing
            </Button>
          ) : (
            <Button onClick={handleShare}>
              Generate Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
