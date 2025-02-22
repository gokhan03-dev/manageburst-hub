
import React from "react";
import { CategorySelect } from "../CategorySelect";
import { Category } from "@/types/task";

interface TaskCategoriesProps {
  categories: Category[];
  watch: any;
  setValue: (name: string, value: any) => void;
  categoryDialogOpen: boolean;
  setCategoryDialogOpen: (open: boolean) => void;
}

export const TaskCategories = ({
  categories,
  watch,
  setValue,
  categoryDialogOpen,
  setCategoryDialogOpen,
}: TaskCategoriesProps) => {
  return (
    <CategorySelect
      categories={categories}
      selectedCategories={watch("categoryIds") || []}
      onAddCategory={(categoryId) => {
        const currentCategories = watch("categoryIds") || [];
        setValue("categoryIds", [...currentCategories, categoryId]);
      }}
      onRemoveCategory={(categoryId) => {
        const currentCategories = watch("categoryIds") || [];
        setValue(
          "categoryIds",
          currentCategories.filter((id: string) => id !== categoryId)
        );
      }}
      onOpenDialog={() => setCategoryDialogOpen(true)}
    />
  );
};
