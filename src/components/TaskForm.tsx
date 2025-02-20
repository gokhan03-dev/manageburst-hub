
import React, { useState } from "react";
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

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
}

export const TaskForm = ({ onSubmit, initialData }: TaskFormProps) => {
  const { tasks } = useTaskContext();
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(
    initialData?.dependencies || []
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

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      dueDate: date?.toISOString() || new Date().toISOString(),
      dependencies: selectedDependencies,
    });
  };

  const availableTasks = tasks.filter(
    (task) => task.id !== initialData?.id && !selectedDependencies.includes(task.id)
  );

  const removeDependency = (taskId: string) => {
    setSelectedDependencies((prev) => prev.filter((id) => id !== taskId));
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
          <div className="border rounded-md p-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-muted-foreground">Due Date</label>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 opacity-50" />
                <span className="text-sm">
                  {date ? format(date, "PPP") : "Pick a date"}
                </span>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                className="mt-2"
              />
            </div>
          </div>
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
