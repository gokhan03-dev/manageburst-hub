
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskDialog } from "./TaskDialog";
import { Task } from "@/types/task";

interface BoardActionsProps {
  onAddTask: () => void;
  taskDialogOpen: boolean;
  setTaskDialogOpen: (open: boolean) => void;
  selectedTask: Task | undefined;
  onTaskSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export const BoardActions = ({
  onAddTask,
  taskDialogOpen,
  setTaskDialogOpen,
  selectedTask,
  onTaskSubmit,
}: BoardActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
        <Button onClick={onAddTask} className="hidden lg:flex">
          <Plus className="w-4 h-4 mr-1" />
          Add a task
        </Button>

        <TaskDialog
          isOpen={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          selectedTask={selectedTask}
          onSubmit={onTaskSubmit}
        />
      </div>
    </div>
  );
};
