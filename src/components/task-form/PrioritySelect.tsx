
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
  const renderPriorityOption = (icon: React.ReactNode, text: string) => (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  );

  return (
    <Select onValueChange={onValueChange} defaultValue={defaultValue}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">
          {renderPriorityOption(
            <Circle className="h-4 w-4 text-blue-500" />,
            "Low"
          )}
        </SelectItem>
        <SelectItem value="medium">
          {renderPriorityOption(
            <AlertCircle className="h-4 w-4 text-amber-500" />,
            "Medium"
          )}
        </SelectItem>
        <SelectItem value="high">
          {renderPriorityOption(
            <AlertTriangle className="h-4 w-4 text-red-500 fill-current" />,
            "High"
          )}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
