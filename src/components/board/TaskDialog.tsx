
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { TaskForm } from "@/components/TaskForm";
import { SyncStatus } from "@/components/integrations/microsoft/SyncStatus";

interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask?: Task;
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export function TaskDialog({
  isOpen,
  onOpenChange,
  selectedTask,
  onSubmit,
}: TaskDialogProps) {
  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    onSubmit({
      ...data,
      eventType: "task",
    });
  };

  const dialogDescription = selectedTask 
    ? "Edit the details of your task" 
    : "Create a new task with the details below";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {selectedTask ? "Edit" : "Create New"} Task
            </DialogTitle>
            {selectedTask && <SyncStatus taskId={selectedTask.id} />}
          </div>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 overflow-y-auto flex-1 pr-6 -mr-6">
          <TaskForm
            onSubmit={handleSubmit}
            initialData={selectedTask}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

