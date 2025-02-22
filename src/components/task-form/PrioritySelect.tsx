
import React from "react";
import { TaskPriority } from "@/types/task";
import { AlertTriangle, AlertCircle, Circle } from "lucide-react";
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
  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue placeholder="Select priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low" className="flex items-center gap-2">
          <Circle className="h-4 w-4 text-blue-500" />
          <span>Low</span>
        </SelectItem>
        <SelectItem value="medium" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span>Medium</span>
        </SelectItem>
        <SelectItem value="high" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 fill-current" />
          <span>High</span>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
