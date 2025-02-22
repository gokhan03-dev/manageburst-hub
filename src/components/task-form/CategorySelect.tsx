
import React, { useState } from "react";
import { Category } from "@/types/task";
import { Tags, Settings, X } from "lucide-react";
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
    <div className="space-y-3">
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
                    className="h-2.5 w-2.5 rounded-full"
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

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedCategories.map((categoryId) => {
            const category = categories.find((c) => c.id === categoryId);
            if (!category) return null;

            return (
              <Badge
                key={categoryId}
                variant="outline"
                className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 text-xs bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100/50 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <button
                  type="button"
                  onClick={() => onRemoveCategory(categoryId)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <CategoryDialog 
        isOpen={dialogOpen} 
        onOpenChange={handleDialogChange}
      />
    </div>
  );
};
