import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { TaskForm } from "@/components/TaskForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskComments } from "@/components/TaskComments";
import { TaskReminders } from "@/components/TaskReminders";

interface TaskDialogProps {
  task?: Task;
  onClose: () => void;
}

export function TaskDialog({ task, onClose }: TaskDialogProps) {
  const handleSubmit = (data: Omit<Task, "id" | "createdAt">) => {
    console.log("Task data submitted:", data);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Edit your task details below." : "Add a new task to your board."}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <TaskForm
              onSubmit={handleSubmit}
              initialData={task}
            />
          </TabsContent>
          
          <TabsContent value="comments" className="mt-4">
            {task && <TaskComments taskId={task.id} />}
          </TabsContent>
          
          <TabsContent value="reminders" className="mt-4">
            {task && <TaskReminders taskId={task.id} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
