
import React from "react";
import { CategoryManager } from "../CategoryManager";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryDialog = ({ isOpen, onOpenChange }: CategoryDialogProps) => {
  // Prevent dialog from closing when clicking inside CategoryManager
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]" 
        onClick={handleClick}
        aria-describedby="category-dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription id="category-dialog-description">
            Create and manage categories for your tasks.
          </DialogDescription>
        </DialogHeader>
        <CategoryManager />
      </DialogContent>
    </Dialog>
  );
};
