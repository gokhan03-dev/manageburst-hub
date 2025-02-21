
import React from "react";
import { Task } from "@/types/task";
import { TaskForm } from "../TaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask?: Task;
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export const TaskDialog = ({
  isOpen,
  onOpenChange,
  selectedTask,
  onSubmit,
}: TaskDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your task below.
          </DialogDescription>
        </DialogHeader>
        <TaskForm onSubmit={onSubmit} initialData={selectedTask} />
      </DialogContent>
    </Dialog>
  );
};
