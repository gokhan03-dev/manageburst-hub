
import React from "react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from "@/contexts/TaskContext";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

export const TaskCard = ({ task, onClick, className }: TaskCardProps) => {
  const { tasks } = useTaskContext();
  
  const priorityColors = {
    low: "bg-task-low text-gray-700",
    medium: "bg-task-medium text-amber-700",
    high: "bg-task-high text-red-700",
  };

  const statusColors = {
    todo: "border-l-gray-300",
    "in-progress": "border-l-blue-400",
    completed: "border-l-green-400",
  };

  const dependencyTasks = tasks.filter((t) => 
    task.dependencies?.includes(t.id)
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md",
        "border-l-4",
        statusColors[task.status],
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            priorityColors[task.priority]
          )}
        >
          <Flag className="mr-1 h-3 w-3" />
          {task.priority}
        </span>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="mr-1 h-4 w-4" />
          {format(new Date(task.dueDate), "MMM dd")}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
      
      {dependencyTasks.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Dependencies:</p>
          <div className="flex flex-wrap gap-1">
            {dependencyTasks.map((depTask) => (
              <Badge key={depTask.id} variant="outline" className="text-xs">
                {depTask.title}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};
