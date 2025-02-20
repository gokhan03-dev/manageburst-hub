
import React, { useState } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TaskDependenciesSelectProps {
  tasks: Task[];
  selectedDependencies: string[];
  currentTaskId?: string;
  onDependenciesChange: (dependencies: string[]) => void;
}

export const TaskDependenciesSelect = ({
  tasks,
  selectedDependencies,
  currentTaskId,
  onDependenciesChange,
}: TaskDependenciesSelectProps) => {
  const [open, setOpen] = useState(false);

  const availableTasks = tasks.filter(
    (task) => task.id !== currentTaskId && !selectedDependencies.includes(task.id)
  );

  const removeDependency = (taskId: string) => {
    onDependenciesChange(selectedDependencies.filter((id) => id !== taskId));
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Dependencies</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            Select dependencies...
            <CalendarIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tasks..." className="h-9" />
            <CommandEmpty>No tasks found.</CommandEmpty>
            <CommandGroup>
              {availableTasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => {
                    onDependenciesChange([...selectedDependencies, task.id]);
                    setOpen(false);
                  }}
                >
                  {task.title}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedDependencies.includes(task.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

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
                onClick={() => removeDependency(depId)}
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
