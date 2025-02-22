import React from "react";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";
import { Calendar, Trash2, CheckSquare, Square, ListChecks, Tags, AlertTriangle, AlertCircle, Circle, Triangle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useTaskContext } from "@/contexts/TaskContext";
import { TaskDependencyGraph } from "./TaskDependencyGraph";
import { useDraggable } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

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
    low: "text-blue-500 dark:text-blue-400",
    medium: "text-green-500 dark:text-green-400",
    high: "text-red-500 dark:text-red-400",
  };

  const priorityIcons = {
    low: <Triangle className="h-4 w-4 rotate-180" />,
    medium: <Circle className="h-4 w-4" />,
    high: <Triangle className="h-4 w-4" />,
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
    e.stopPropagation();
    updateTask({
      ...task,
      status: task.status === 'completed' ? 'todo' : 'completed'
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };

  const displayTags = task.tags?.slice(0, 3) || [];
  const hasMoreTags = task.tags && task.tags.length > 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing dark:bg-card dark:border-border/50",
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
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
          <span className={cn("", priorityColors[task.priority])}>
            {priorityIcons[task.priority]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {format(new Date(task.dueDate), "MMM dd")}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete task"
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
      
      {(displayTags.length > 0 || taskCategories.length > 0) && (
        <div className="mb-2 flex flex-wrap gap-1">
          {taskCategories.map((category) => (
            <Badge
              key={category.id}
              variant="secondary"
              className="text-xs px-1"
              style={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
              }}
            >
              <div
                className="mr-1 h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.name}
            </Badge>
          ))}
          {displayTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-1"
              style={{
                backgroundColor: `${tag.color}15`,
                borderColor: tag.color,
                color: tag.color,
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {hasMoreTags && (
            <Tooltip>
              <TooltipTrigger>
                <Tags className="h-3 w-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                {task.tags!.length - 3} more tags
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      <h3 className={cn(
        "text-sm font-medium text-foreground mb-1",
        task.status === 'completed' && "line-through text-muted-foreground"
      )}>
        {task.title}
      </h3>
      
      {task.description && (
        <p className={cn(
          "text-xs text-muted-foreground line-clamp-2 mb-2",
          task.status === 'completed' && "line-through"
        )}>
          {task.description}
        </p>
      )}
      
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        {task.subtasks && task.subtasks.length > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1">
                <ListChecks className="h-3 w-3" />
                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Subtasks completed</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {showDependencies && <TaskDependencyGraph task={task} allTasks={tasks} />}
      
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
};
