
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriority, EventType } from "@/types/task";
import { PrioritySelect } from "./PrioritySelect";
import { DatePicker } from "./DatePicker";
import { Label } from "@/components/ui/label";

interface TaskBasicInfoProps {
  register: UseFormRegister<any>;
  setValue: (name: string, value: any) => void;
  defaultPriority: TaskPriority;
  dueDate?: string;
  taskType: EventType;
}

export const TaskBasicInfo = ({
  register,
  setValue,
  defaultPriority,
  dueDate,
  taskType,
}: TaskBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <Input
        {...register("title", { required: true })}
        placeholder="Task title"
        className="text-lg"
      />

      <Textarea
        {...register("description")}
        placeholder="Description"
        className="min-h-[100px]"
      />

      {taskType === 'task' && (
        <div className="flex items-center gap-4">
          <div className="w-1/4 space-y-2">
            <Label>Priority</Label>
            <PrioritySelect
              defaultValue={defaultPriority}
              onValueChange={(value: TaskPriority) => setValue("priority", value)}
            />
          </div>

          <div className="w-1/3 space-y-2">
            <Label>Deadline</Label>
            <DatePicker
              date={dueDate ? new Date(dueDate) : undefined}
              onSelect={(date) => setValue("dueDate", date?.toISOString())}
            />
          </div>
        </div>
      )}
    </div>
  );
};
