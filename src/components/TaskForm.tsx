
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTaskContext } from "@/contexts/TaskContext";
import { Badge } from "@/components/ui/badge";
import { CustomPopover } from "@/components/ui/custom-popover";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

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

  const availableTasks = tasks.filter(
    (task) => task.id !== initialData?.id && !selectedDependencies.includes(task.id)
  );

  const removeDependency = (taskId: string) => {
    setSelectedDependencies((prev) => prev.filter((id) => id !== taskId));
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
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
          <Select
            onValueChange={(value: TaskPriority) => setValue("priority", value)}
            defaultValue={initialData?.priority || "low"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <CustomPopover
            trigger={
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
                type="button"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            }
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
              }}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              initialFocus
            />
          </CustomPopover>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Categories</p>
        <Select
          onValueChange={(value: string) => {
            if (!selectedCategories.includes(value)) {
              setSelectedCategories((prev) => [...prev, value]);
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
                  onClick={() => removeCategory(categoryId)}
                  className="ml-1 rounded-full p-1 hover:bg-secondary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Dependencies</p>
        <Select
          onValueChange={(value: string) => {
            setSelectedDependencies((prev) => [...prev, value]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Add dependency" />
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-2 flex flex-wrap gap-2">
          {selectedDependencies.map((depId) => {
            const task = tasks.find((t) => t.id === depId);
            if (!task) return null;
            return (
              <Badge
                key={depId}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {task.title}
                <button
                  type="button"
                  onClick={() => removeDependency(depId)}
                  className="ml-1 rounded-full p-1 hover:bg-secondary"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};
