
import React from "react";
import { Category } from "@/types/task";
import { CategoryItem } from "./CategoryItem";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const CategoryList = ({ categories, onEdit, onDelete }: CategoryListProps) => {
  return (
    <div className="grid gap-2">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
