
import React from "react";
import { Task } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
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
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveDependency(depId)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
