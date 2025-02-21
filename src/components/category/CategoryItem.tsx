
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { CategoryItemProps } from "./types";

export const CategoryItem = ({ category, onEdit, onDelete }: CategoryItemProps) => {
  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg border bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span>{category.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onEdit(category, e)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => onDelete(category.id, e)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
