
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
import { SyncStatus } from "@/components/integrations/microsoft/SyncStatus";

interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTask?: Task;
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export function TaskDialog({ isOpen, onOpenChange, selectedTask, onSubmit }: TaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{selectedTask ? "Edit Task" : "Create Task"}</DialogTitle>
              <DialogDescription>
                {selectedTask ? "Edit your task details below." : "Add a new task to your board."}
              </DialogDescription>
            </div>
            {selectedTask && <SyncStatus taskId={selectedTask.id} />}
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="details" className="h-full overflow-auto">
              <TaskForm
                onSubmit={onSubmit}
                initialData={selectedTask}
              />
            </TabsContent>
            
            <TabsContent value="calendar" className="h-full overflow-auto">
              {selectedTask && <TaskCalendarDetails taskId={selectedTask.id} />}
            </TabsContent>
            
            <TabsContent value="comments" className="h-full overflow-hidden">
              {selectedTask && <TaskComments taskId={selectedTask.id} />}
            </TabsContent>
            
            <TabsContent value="reminders" className="h-full overflow-auto">
              {selectedTask && <TaskReminders taskId={selectedTask.id} />}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

