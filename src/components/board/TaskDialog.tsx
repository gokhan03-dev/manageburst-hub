
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
import { ClipboardList, Video } from "lucide-react";

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

  // Reset selected type when dialog opens/closes or selected task changes
  React.useEffect(() => {
    if (selectedTask) {
      setSelectedType(selectedTask.eventType || "task");
    }
  }, [selectedTask, isOpen]);

  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    onSubmit({
      ...data,
      // Preserve the original task type when editing
      eventType: selectedTask ? selectedTask.eventType : selectedType,
    });
  };

  const TaskTypeSelector = () => (
    <div className="mb-6">
      <div className="flex gap-2 bg-secondary p-1 rounded-lg w-fit">
        {[
          { type: 'task', icon: <ClipboardList className="h-4 w-4" /> },
          { type: 'meeting', icon: <Video className="h-4 w-4" /> }
        ].map(({ type, icon }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type as EventType)}
            className={cn(
              "px-4 py-2 rounded-md capitalize transition-all flex items-center gap-2",
              selectedType === type
                ? "bg-background shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {icon}
            {type}
          </button>
        ))}
      </div>
    </div>
  );

  // Determine which type to display in form and title
  const displayType = selectedTask ? selectedTask.eventType : selectedType;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {selectedTask ? "Edit" : "Create New"} {displayType}
            </DialogTitle>
            {selectedTask && <SyncStatus taskId={selectedTask.id} />}
          </div>
        </DialogHeader>

        <div className="mt-6 overflow-y-auto flex-1 pr-6 -mr-6">
          {!selectedTask && <TaskTypeSelector />}
          <TaskForm
            onSubmit={handleSubmit}
            initialData={selectedTask}
            taskType={displayType}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
