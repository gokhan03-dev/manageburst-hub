
import { Category } from "@/types/task";

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  initialData?: CategoryFormData;
  title: string;
  submitLabel: string;
}

export interface CategoryItemProps {
  category: Category;
  onEdit: (category: Category, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}
