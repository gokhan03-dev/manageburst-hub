
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFormProps, CategoryFormData } from "./types";

export const CategoryForm = ({ onSubmit, initialData, title, submitLabel }: CategoryFormProps) => {
  const [formData, setFormData] = React.useState<CategoryFormData>(
    initialData || {
      name: "",
      color: "#000000",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Category name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          type="color"
          value={formData.color}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, color: e.target.value }))
          }
          className="h-10 w-full"
        />
      </div>
      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
};
