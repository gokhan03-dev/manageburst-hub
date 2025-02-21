
import React from "react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { Calendar, Flag, Trash2, CheckSquare, Square } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskDependencyGraph } from "./TaskDependencyGraph";
import { useDraggable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  showDependencies?: boolean;
}

export const TaskCard = ({ task, onClick, className, showDependencies = true }: TaskCardProps) => {
  const { tasks, updateTask, deleteTask } = useTaskContext();
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (error) throw error;
      return data;
    },
  });
  
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
    low: "bg-task-low text-gray-700 dark:bg-blue-900/30 dark:text-blue-200",
    medium: "bg-task-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    high: "bg-task-high text-red-700 dark:bg-red-900/30 dark:text-red-200",
  };

  const statusColors = {
    todo: "border-l-gray-300 dark:border-l-gray-600",
    "in-progress": "border-l-blue-400 dark:border-l-blue-500",
    completed: "border-l-green-400 dark:border-l-green-500",
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
  } : undefined;

  const taskCategories = categories.filter(
    (category) => task.categoryIds?.includes(category.id)
  );

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    updateTask({
      ...task,
      status: task.status === 'completed' ? 'todo' : 'completed'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    deleteTask(task.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing dark:bg-card dark:border-border/50",
        "border-l-4",
        statusColors[task.status],
        isDragging && "opacity-50",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleStatusToggle}
            className="hover:text-primary transition-colors"
            aria-label={task.status === 'completed' ? "Mark as incomplete" : "Mark as complete"}
          >
            {task.status === 'completed' ? (
              <CheckSquare className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
          </button>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              priorityColors[task.priority]
            )}
          >
            <Flag className="mr-1 h-3 w-3" />
            {task.priority}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {format(new Date(task.dueDate), "MMM dd")}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      {taskCategories.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {taskCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
              }}
            >
              <div
                className="mr-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Badge>
          ))}
        </div>
      )}

      <h3 className={cn(
        "text-lg font-semibold text-foreground",
        task.status === 'completed' && "line-through text-muted-foreground"
      )}>
        {task.title}
      </h3>
      <p className={cn(
        "mt-1 text-sm text-muted-foreground line-clamp-2",
        task.status === 'completed' && "line-through"
      )}>
        {task.description}
      </p>
      
      {showDependencies && <TaskDependencyGraph task={task} allTasks={tasks} />}
      
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};
