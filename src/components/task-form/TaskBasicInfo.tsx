
import React from "react";
import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TaskPriority, EventType } from "@/types/task";

interface TaskBasicInfoProps {
  register: UseFormRegister<any>;
  setValue: (name: string, value: any) => void;
  defaultPriority: TaskPriority;
  dueDate?: string;
  taskType: EventType;
}

export const TaskBasicInfo = ({
  register,
  taskType,
}: TaskBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <Input
        {...register("title", { required: true })}
        placeholder={`${taskType} title`}
        className="text-lg"
      />

      <Textarea
        {...register("description")}
        placeholder="Description"
        className="min-h-[100px]"
      />
    </div>
  );
};
