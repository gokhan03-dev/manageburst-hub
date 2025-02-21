
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EventType, Sensitivity, Task, Attendee, AttendeeResponse } from "@/types/task";
import { toast } from "@/components/ui/use-toast";

export function useTaskCalendar(taskId: string) {
  const { data: task, isLoading, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data: taskData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      
      const attendees = taskData.attendees ? (taskData.attendees as any[]).map(a => ({
        email: a.email as string,
        required: a.required as boolean,
        response: a.response as AttendeeResponse
      })) : [];
      
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
      const updateData: Record<string, unknown> = {
        event_type: updates.eventType,
        location: updates.location,
        online_meeting_url: updates.onlineMeetingUrl,
        sensitivity: updates.sensitivity,
        is_all_day: updates.isAllDay,
        start_time: updates.startTime,
        end_time: updates.endTime
      };

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

  return { task, isLoading, handleUpdateTask };
}
