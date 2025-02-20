
import React from "react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskDependencyGraph } from "./TaskDependencyGraph";
import { useDraggable } from "@dnd-kit/core";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  showDependencies?: boolean;
}

export const TaskCard = ({ task, onClick, className, showDependencies = true }: TaskCardProps) => {
  const { tasks } = useTaskContext();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });
  
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

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
        "border-l-4",
        statusColors[task.status],
        isDragging && "opacity-50",
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
      
      {showDependencies && <TaskDependencyGraph task={task} allTasks={tasks} />}
      
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};
