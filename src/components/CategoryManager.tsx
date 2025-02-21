
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/task";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryForm } from "./category/CategoryForm";
import { CategoryList } from "./category/CategoryList";
import { CategoryFormData } from "./category/types";

export const CategoryManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const { error } = await supabase.from("categories").insert([
        {
          name: data.name,
          color: data.color,
          user_id: user?.id,
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (!editingCategory) return;
      const { error } = await supabase
        .from("categories")
        .update({
          name: data.name,
          color: data.color,
        })
        .eq("id", editingCategory.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      setIsOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory.mutate(data);
    } else {
      createCategory.mutate(data);
    }
  };

  const handleEdit = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCategory(category);
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="default" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleSubmit}
              initialData={
                editingCategory
                  ? {
                      name: editingCategory.name,
                      color: editingCategory.color,
                    }
                  : undefined
              }
              title={editingCategory ? "Edit Category" : "Create Category"}
              submitLabel={editingCategory ? "Update" : "Create"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryList
        categories={categories}
        onEdit={handleEdit}
        onDelete={(id, e) => {
          e.stopPropagation();
          deleteCategory.mutate(id);
        }}
      />
    </div>
  );
};
