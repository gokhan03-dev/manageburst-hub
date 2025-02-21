
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventType, Sensitivity, Task } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      return data as Task;
    },
  });

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
        <Select defaultValue={task.eventType || "task"}>
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
        />
      </div>

      <div className="space-y-2">
        <Label>Online Meeting URL</Label>
        <Input 
          placeholder="Add meeting link"
          defaultValue={task.onlineMeetingUrl}
        />
      </div>

      <div className="space-y-2">
        <Label>Sensitivity</Label>
        <Select defaultValue={task.sensitivity || "normal"}>
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
    </div>
  );
}
