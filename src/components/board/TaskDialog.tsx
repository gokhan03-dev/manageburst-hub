
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task, EventType } from "@/types/task";
import { cn } from "@/lib/utils";
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
  const [selectedType, setSelectedType] = useState<EventType>(
    selectedTask?.eventType || "task"
  );

  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    onSubmit({
      ...data,
      eventType: selectedType,
    });
  };

  const TaskTypeSelector = () => (
    <div className="mb-6">
      <div className="flex gap-2 bg-secondary p-1 rounded-lg w-fit">
        {['task', 'meeting', 'reminder'].map(type => (
          <button
            key={type}
            onClick={() => setSelectedType(type as EventType)}
            className={cn(
              "px-4 py-2 rounded-md capitalize transition-all",
              selectedType === type
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {selectedTask ? "Edit" : "Create New"} {selectedType}
            </DialogTitle>
            {selectedTask && <SyncStatus taskId={selectedTask.id} />}
          </div>
        </DialogHeader>

        <div className="mt-6">
          <TaskTypeSelector />
          <TaskForm
            onSubmit={handleSubmit}
            initialData={selectedTask}
            taskType={selectedType}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
