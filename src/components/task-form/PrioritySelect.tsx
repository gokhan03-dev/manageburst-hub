
import React from "react";
import { TaskPriority } from "@/types/task";
import { Triangle, Circle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrioritySelectProps {
  defaultValue: TaskPriority;
  onValueChange: (value: TaskPriority) => void;
}

export const PrioritySelect = ({
  defaultValue,
  onValueChange,
}: PrioritySelectProps) => {
  const renderPriorityOption = (priority: TaskPriority) => {
    const getIcon = (priority: TaskPriority) => {
      switch (priority) {
        case "high":
          return <Triangle className="h-4 w-4 text-orange-500" />;
        case "medium":
          return <Circle className="h-4 w-4 text-green-500" />;
        case "low":
          return <Triangle className="h-4 w-4 text-blue-500 rotate-180" />;
      }
    };

    return (
      <div className="flex items-center gap-2">
        {getIcon(priority)}
        <span className="capitalize">{priority}</span>
      </div>
    );
  };

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="high">
          {renderPriorityOption("high")}
        </SelectItem>
        <SelectItem value="medium">
          {renderPriorityOption("medium")}
        </SelectItem>
        <SelectItem value="low">
          {renderPriorityOption("low")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
