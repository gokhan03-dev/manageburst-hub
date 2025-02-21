
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTaskContext } from "@/contexts/TaskContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { DependencySelect } from "./task-form/DependencySelect";
import { CategorySelect } from "./task-form/CategorySelect";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { DatePicker } from "./task-form/DatePicker";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
}

export const TaskForm = ({ onSubmit, initialData }: TaskFormProps) => {
  const { tasks } = useTaskContext();
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    initialData?.dependencies || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categoryIds || []
  );
  const [date, setDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : new Date()
  );

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "low" as TaskPriority,
      status: "todo" as TaskStatus,
      dueDate: new Date().toISOString(),
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      dueDate: date?.toISOString() || new Date().toISOString(),
      dependencies: selectedDependencies,
      categoryIds: selectedCategories,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Task title"
          {...register("title", { required: true })}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Task description"
          {...register("description")}
          className="min-h-[100px] w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <PrioritySelect
            defaultValue={initialData?.priority || "low"}
            onValueChange={(value: TaskPriority) => setValue("priority", value)}
          />
        </div>

        <div className="space-y-2">
          <DatePicker
            date={date}
            onSelect={(newDate) => setDate(newDate)}
          />
        </div>
      </div>

      <CategorySelect
        categories={categories}
        selectedCategories={selectedCategories}
        onAddCategory={(categoryId) => setSelectedCategories((prev) => [...prev, categoryId])}
        onRemoveCategory={(categoryId) => 
          setSelectedCategories((prev) => prev.filter((id) => id !== categoryId))
        }
      />

      <DependencySelect
        tasks={tasks}
        selectedDependencies={selectedDependencies}
        initialTaskId={initialData?.id}
        onAddDependency={(taskId) => setSelectedDependencies((prev) => [...prev, taskId])}
        onRemoveDependency={(taskId) => 
          setSelectedDependencies((prev) => prev.filter((id) => id !== taskId))
        }
      />

      <Button type="submit" className="w-full">
        {initialData ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};
