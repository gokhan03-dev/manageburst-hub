
import React from "react";
import { Task } from "@/types/task";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DependencySelectProps {
  tasks: Task[];
  selectedDependencies: string[];
  initialTaskId?: string;
  onAddDependency: (taskId: string) => void;
  onRemoveDependency: (taskId: string) => void;
}

export const DependencySelect = ({
  tasks,
  selectedDependencies,
  initialTaskId,
  onAddDependency,
  onRemoveDependency,
}: DependencySelectProps) => {
  const availableTasks = tasks.filter(
    (task) => task.id !== initialTaskId && !selectedDependencies.includes(task.id)
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Dependencies</p>
      <Select onValueChange={onAddDependency}>
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
                onClick={() => onRemoveDependency(depId)}
                className="ml-1 rounded-full p-1 hover:bg-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
