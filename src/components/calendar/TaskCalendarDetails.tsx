
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventType, Sensitivity, Task, Attendee, AttendeeResponse } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface TaskCalendarDetailsProps {
  taskId: string;
}

export function TaskCalendarDetails({ taskId }: TaskCalendarDetailsProps) {
  const { data: task, isLoading, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data: taskData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      
      // Safe type conversion of attendees from JSON to Attendee[]
      const attendees = taskData.attendees ? (taskData.attendees as any[]).map(a => ({
        email: a.email as string,
        required: a.required as boolean,
        response: a.response as AttendeeResponse
      })) : [];
      
      // Transform the data to match the Task type
      return {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.due_date,
        createdAt: taskData.created_at,
        eventType: taskData.event_type as EventType,
        startTime: taskData.start_time,
        endTime: taskData.end_time,
        isAllDay: taskData.is_all_day,
        location: taskData.location,
        attendees,
        onlineMeetingUrl: taskData.online_meeting_url,
        sensitivity: taskData.sensitivity as Sensitivity
      } as Task;
    },
  });

  const handleUpdateTask = async (updates: Partial<Task>) => {
    try {
      // Convert Attendee[] to a JSON-compatible format
      const updateData: Record<string, unknown> = {
        event_type: updates.eventType,
        location: updates.location,
        online_meeting_url: updates.onlineMeetingUrl,
        sensitivity: updates.sensitivity,
        is_all_day: updates.isAllDay,
        start_time: updates.startTime,
        end_time: updates.endTime
      };

      // Only include attendees if they are being updated
      if (updates.attendees) {
        updateData.attendees = updates.attendees.map(a => ({
          email: a.email,
          required: a.required,
          response: a.response
        }));
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      await refetch();
      toast({
        title: "Success",
        description: "Task calendar details updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task calendar details",
        variant: "destructive",
      });
    }
  };

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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Attendees</Label>
          <Button variant="outline" size="sm" onClick={handleAddAttendee}>
            <Plus className="h-4 w-4 mr-1" />
            Add Attendee
          </Button>
        </div>
        <div className="space-y-2">
          {task.attendees?.map((attendee) => (
            <div key={attendee.email} className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex-1">
                <p className="text-sm font-medium">{attendee.email}</p>
                <Select 
                  value={attendee.response || "tentative"}
                  onValueChange={(value) => handleUpdateAttendeeResponse(attendee.email, value as AttendeeResponse)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="tentative">Tentative</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemoveAttendee(attendee.email)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
