
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task, EventType } from "@/types/task";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock, ListTodo, Bell, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskForm } from "@/components/TaskForm";
import { SyncStatus } from "@/components/integrations/microsoft/SyncStatus";

interface TaskTypeOption {
  type: EventType;
  title: string;
  description: string;
  icon: React.ElementType;
}

const taskTypes: TaskTypeOption[] = [
  {
    type: "task",
    title: "Task",
    description: "Create a new task with subtasks and dependencies",
    icon: ListTodo,
  },
  {
    type: "meeting",
    title: "Meeting",
    description: "Schedule a meeting with attendees and location",
    icon: CalendarClock,
  },
  {
    type: "reminder",
    title: "Reminder",
    description: "Set a simple reminder with notification",
    icon: Bell,
  },
];

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
  const [selectedType, setSelectedType] = useState<EventType | null>(
    selectedTask?.eventType || null
  );

  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    onSubmit({
      ...data,
      eventType: selectedType || "task",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {selectedTask
                  ? "Edit " + (selectedTask.eventType || "Task")
                  : "Create New Item"}
              </DialogTitle>
            </div>
            {selectedTask && <SyncStatus taskId={selectedTask.id} />}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!selectedType && !selectedTask ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              {taskTypes.map((type) => (
                <Card
                  key={type.type}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105 hover:shadow-lg",
                    "border-2 hover:border-primary"
                  )}
                  onClick={() => setSelectedType(type.type)}
                >
                  <CardHeader>
                    <type.icon className="w-8 h-8 mb-2 text-primary" />
                    <CardTitle>{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <TaskForm
              onSubmit={handleSubmit}
              initialData={selectedTask}
              taskType={selectedType || selectedTask?.eventType || "task"}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
