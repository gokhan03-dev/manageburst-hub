
import React from "react";
import { EventType, Sensitivity, Attendee, AttendeeResponse } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskCalendar } from "@/hooks/useTaskCalendar";
import { TaskAttendees } from "./TaskAttendees";

interface TaskCalendarDetailsProps {
  taskId: string;
}

export function TaskCalendarDetails({ taskId }: TaskCalendarDetailsProps) {
  const { task, isLoading, handleUpdateTask } = useTaskCalendar(taskId);

  const handleAddAttendee = () => {
    if (!task) return;
    
    const email = window.prompt("Enter attendee email:");
    if (!email) return;

    const newAttendee: Attendee = {
      email,
      required: true,
      response: "tentative"
    };

    handleUpdateTask({
      attendees: [...(task.attendees || []), newAttendee]
    });
  };

  const handleRemoveAttendee = (email: string) => {
    if (!task) return;

    handleUpdateTask({
      attendees: task.attendees?.filter(a => a.email !== email) || []
    });
  };

  const handleUpdateAttendeeResponse = (email: string, response: AttendeeResponse) => {
    if (!task) return;

    handleUpdateTask({
      attendees: task.attendees?.map(a => 
        a.email === email ? { ...a, response } : a
      ) || []
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Event Type</Label>
        <Select 
          defaultValue={task.eventType || "task"}
          onValueChange={(value) => handleUpdateTask({ eventType: value as EventType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="appointment">Appointment</SelectItem>
            <SelectItem value="reminder">Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input 
          placeholder="Add location"
          defaultValue={task.location}
          onChange={(e) => handleUpdateTask({ location: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Online Meeting URL</Label>
        <Input 
          placeholder="Add meeting link"
          defaultValue={task.onlineMeetingUrl}
          onChange={(e) => handleUpdateTask({ onlineMeetingUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Sensitivity</Label>
        <Select 
          defaultValue={task.sensitivity || "normal"}
          onValueChange={(value) => handleUpdateTask({ sensitivity: value as Sensitivity })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sensitivity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="confidential">Confidential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <TaskAttendees
        attendees={task.attendees || []}
        onAddAttendee={handleAddAttendee}
        onRemoveAttendee={handleRemoveAttendee}
        onUpdateAttendeeResponse={handleUpdateAttendeeResponse}
      />
    </div>
  );
}
