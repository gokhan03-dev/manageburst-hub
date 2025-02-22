
import React from "react";
import { TaskPriority } from "@/types/task";
import { Triangle } from "lucide-react";
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
    const getIconStyles = (priority: TaskPriority) => {
      switch (priority) {
        case "high":
          return "text-orange-500 rotate-0";
        case "medium":
          return "text-green-500 rounded-full border-2 border-current";
        case "low":
          return "text-blue-500 rotate-180";
      }
    };

    return (
      <div className="flex items-center gap-2">
        <Triangle 
          className={`h-4 w-4 transition-transform ${getIconStyles(priority)}`} 
          strokeWidth={priority === "medium" ? 0 : 2}
          fill={priority === "medium" ? "currentColor" : "none"}
        />
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
