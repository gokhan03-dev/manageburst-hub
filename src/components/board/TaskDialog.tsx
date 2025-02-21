
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask?: Task;
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export function TaskDialog({ isOpen, onOpenChange, selectedTask, onSubmit }: TaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {selectedTask ? "Edit your task details below." : "Add a new task to your board."}
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
              onSubmit={onSubmit}
              initialData={selectedTask}
            />
          </TabsContent>
          
          <TabsContent value="comments" className="mt-4">
            {selectedTask && <TaskComments taskId={selectedTask.id} />}
          </TabsContent>
          
          <TabsContent value="reminders" className="mt-4">
            {selectedTask && <TaskReminders taskId={selectedTask.id} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
