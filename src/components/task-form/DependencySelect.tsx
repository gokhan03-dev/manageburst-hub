
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
import { X, Link2 } from "lucide-react";

interface DependencySelectProps {
  tasks: Task[];
  selectedDependencies: string[];
  onDependencyChange: (dependencies: string[]) => void;
  currentTaskId?: string;
  placeholder?: string;  // Added this prop to the interface
}

export function DependencySelect({
  tasks,
  selectedDependencies,
  onDependencyChange,
  currentTaskId,
  placeholder = "Select dependencies",  // Added default value
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          onValueChange={handleAddDependency}
          value=""
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {availableTasks.map((task) => (
              <SelectItem key={task.id} value={task.id}>
                {task.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDependencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedDependencies.map((depId) => {
            const task = tasks.find((t) => t.id === depId);
            if (!task) return null;

            return (
              <Badge
                key={depId}
                variant="outline"
                className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 text-xs bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100/50 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
              >
                {task.title}
                <button
                  type="button"
                  onClick={() => handleRemoveDependency(depId)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
