
import React from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
}

export const TaskForm = ({ onSubmit, initialData }: TaskFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "low" as TaskPriority,
      status: "todo" as TaskStatus,
      dueDate: new Date().toISOString(),
    },
  });

  const dueDate = watch("dueDate");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(new Date(dueDate), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(dueDate)}
                onSelect={(date) =>
                  setValue("dueDate", date?.toISOString() || new Date().toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? "Update Task" : "Create Task"}
      </Button>
    </form>
  );
};
