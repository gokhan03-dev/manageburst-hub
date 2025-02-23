
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Video, ClipboardList } from "lucide-react";
import { TaskDialog } from "./TaskDialog";
import { MeetingDialog } from "./MeetingDialog";
import { Task } from "@/types/task";

interface BoardActionsProps {
  onAddTask: () => void;
  taskDialogOpen: boolean;
  setTaskDialogOpen: (open: boolean) => void;
  selectedTask: Task | undefined;
  onTaskSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  meetingDialogOpen: boolean;
  setMeetingDialogOpen: (open: boolean) => void;
  selectedMeeting: Task | undefined;
  onMeetingSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
}

export const BoardActions = ({
  onAddTask,
  taskDialogOpen,
  setTaskDialogOpen,
  selectedTask,
  onTaskSubmit,
  meetingDialogOpen,
  setMeetingDialogOpen,
  selectedMeeting,
  onMeetingSubmit,
}: BoardActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
        <Button onClick={onAddTask} className="hidden lg:flex">
          <ClipboardList className="w-4 h-4 mr-1" />
          Add a task
        </Button>
        <Button 
          onClick={() => setMeetingDialogOpen(true)} 
          variant="outline" 
          className="hidden lg:flex"
        >
          <Video className="w-4 h-4 mr-1" />
          Schedule meeting
        </Button>

        <TaskDialog
          isOpen={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          selectedTask={selectedTask}
          onSubmit={onTaskSubmit}
        />

        <MeetingDialog
          isOpen={meetingDialogOpen}
          onOpenChange={setMeetingDialogOpen}
          selectedMeeting={selectedMeeting}
          onSubmit={onMeetingSubmit}
        />
      </div>
    </div>
  );
};
