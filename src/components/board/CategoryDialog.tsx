
import React from "react";
import { CategoryManager } from "../CategoryManager";
import { Button } from "@/components/ui/button";
import { Tags } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryDialog = ({ isOpen, onOpenChange }: CategoryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Tags className="h-4 w-4" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create and manage categories for your tasks.
          </DialogDescription>
        </DialogHeader>
        <CategoryManager />
      </DialogContent>
    </Dialog>
  );
};
