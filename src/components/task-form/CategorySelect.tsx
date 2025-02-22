
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
    // Remove current category if exists
    if (selectedCategories.length > 0) {
      onRemoveCategory(selectedCategories[0]);
    }
    // Add new category
    onAddCategory(value);
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategories[0]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tags className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedCategories[0] || ""}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue>
              {currentCategory ? (
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: currentCategory.color }}
                  />
                  {currentCategory.name}
                </div>
              ) : (
                "Select category"
              )}
            </SelectValue>
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

      <CategoryDialog 
        isOpen={dialogOpen} 
        onOpenChange={handleDialogChange}
      />
    </div>
  );
};
