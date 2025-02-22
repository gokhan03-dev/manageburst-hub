
import React from "react";
import { Task } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DependencySelectProps {
  tasks: Task[];
  selectedDependencies: string[];
  onDependencyChange: (dependencies: string[]) => void;
  currentTaskId?: string;
}

export function DependencySelect({
  tasks,
  selectedDependencies,
  onDependencyChange,
  currentTaskId,
}: DependencySelectProps) {
  const availableTasks = tasks.filter(
    (task) => task.id !== currentTaskId && !selectedDependencies.includes(task.id)
  );

  const handleAddDependency = (taskId: string) => {
    onDependencyChange([...selectedDependencies, taskId]);
  };

  const handleRemoveDependency = (taskId: string) => {
    onDependencyChange(selectedDependencies.filter((id) => id !== taskId));
  };

  return (
    <div className="flex-1 space-y-2">
      <Select
        onValueChange={handleAddDependency}
        value=""
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select dependencies" />
        </SelectTrigger>
        <SelectContent>
          {availableTasks.map((task) => (
            <SelectItem key={task.id} value={task.id}>
              {task.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap gap-2">
        {selectedDependencies.map((depId) => {
          const task = tasks.find((t) => t.id === depId);
          if (!task) return null;

          return (
            <Badge
              key={depId}
              variant="outline"
              className="flex items-center gap-1 px-2 py-0.5 text-xs border-blue-400 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400"
            >
              {task.title}
              <button
                type="button"
                onClick={() => handleRemoveDependency(depId)}
                className="ml-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
