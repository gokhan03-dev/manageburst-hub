
import React, { useState } from "react";
import { Category } from "@/types/task";
import { X, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDialog } from "@/components/board/CategoryDialog";

interface CategorySelectProps {
  categories: Category[];
  selectedCategories: string[];
  onAddCategory: (categoryId: string) => void;
  onRemoveCategory: (categoryId: string) => void;
}

export const CategorySelect = ({
  categories,
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
}: CategorySelectProps) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Categories</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCategoryDialogOpen(true)}
          className="gap-2"
        >
          <Tags className="h-4 w-4" />
          Manage Categories
        </Button>
      </div>
      
      <Select
        onValueChange={(value: string) => {
          if (!selectedCategories.includes(value)) {
            onAddCategory(value);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Add category" />
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

      <div className="mt-2 flex flex-wrap gap-2">
        {selectedCategories.map((categoryId) => {
          const category = categories.find((c) => c.id === categoryId);
          if (!category) return null;
          return (
            <Badge
              key={categoryId}
              variant="secondary"
              className="flex items-center gap-1"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
              <button
                type="button"
                onClick={() => onRemoveCategory(categoryId)}
                className="ml-1 rounded-full p-1 hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>

      <CategoryDialog
        isOpen={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />
    </div>
  );
};
