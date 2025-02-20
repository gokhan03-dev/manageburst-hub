
import React from "react";
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskDependencyGraphProps {
  task: Task;
  allTasks: Task[];
}

export const TaskDependencyGraph = ({ task, allTasks }: TaskDependencyGraphProps) => {
  const getDependencyTasks = () => {
    return task.dependencies?.map(depId => 
      allTasks.find(t => t.id === depId)
    ).filter(Boolean) as Task[];
  };

  const dependencyTasks = getDependencyTasks();
  
  if (!dependencyTasks.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Dependencies</h4>
      <div className="space-y-2">
        {dependencyTasks.map((depTask) => (
          <div
            key={depTask.id}
            className="flex items-center gap-2 p-2 rounded-md border bg-background"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {depTask.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{depTask.status === "completed" ? "Completed" : "Pending"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="text-sm flex-1">{depTask.title}</span>
            <Badge variant={depTask.status === "completed" ? "default" : "secondary"}>
              {depTask.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
