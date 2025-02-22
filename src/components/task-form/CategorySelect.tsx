
import React, { useState } from "react";
import { Category } from "@/types/task";
import { Tags, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "@/components/board/CategoryDialog";
import { X } from "lucide-react";

interface CategorySelectProps {
  categories: Category[];
  selectedCategories: string[];
  onAddCategory: (categoryId: string) => void;
  onRemoveCategory: (categoryId: string) => void;
  onOpenDialog: () => void;
}

export const CategorySelect = ({
  categories,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  onOpenDialog,
}: CategorySelectProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDialogOpen(true);
    onOpenDialog();
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      onOpenDialog();
    }
  };

  const handleCategoryChange = (value: string) => {
    if (selectedCategories.includes(value)) {
      onRemoveCategory(value);
    } else {
      onAddCategory(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tags className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          value=""
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleOpenDialog}
          type="button"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((categoryId) => {
          const category = categories.find((c) => c.id === categoryId);
          if (!category) return null;

          return (
            <Badge
              key={categoryId}
              variant="outline"
              className="flex items-center gap-1 px-2 py-0.5 text-xs border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
              <button
                type="button"
                onClick={() => onRemoveCategory(categoryId)}
                className="ml-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      <CategoryDialog 
        isOpen={dialogOpen} 
        onOpenChange={handleDialogChange}
      />
    </div>
  );
};
