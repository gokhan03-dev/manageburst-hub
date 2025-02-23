
import React from "react";
import { Button } from "@/components/ui/button";
import { Video, ClipboardList } from "lucide-react";

interface BoardActionsProps {
  onAddTask: () => void;
  onAddMeeting: () => void;
}

export const BoardActions = ({
  onAddTask,
  onAddMeeting,
}: BoardActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-2">
        <Button onClick={onAddTask} className="hidden lg:flex">
          <ClipboardList className="w-4 h-4 mr-1" />
          Add a task
        </Button>
        <Button 
          onClick={onAddMeeting} 
          variant="outline" 
          className="hidden lg:flex"
        >
          <Video className="w-4 h-4 mr-1" />
          Schedule meeting
        </Button>
      </div>
    </div>
  );
};
