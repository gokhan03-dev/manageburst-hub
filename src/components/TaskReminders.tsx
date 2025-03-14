
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CustomPopover } from "@/components/ui/custom-popover";
import { format } from "date-fns";
import { CalendarIcon, BellRing, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Reminder {
  id: string;
  reminder_time: string;
  reminder_type: string;
}

export const TaskReminders = ({ taskId }: { taskId: string }) => {
  const queryClient = useQueryClient();
  const [date, setDate] = React.useState<Date>();
  const { user } = useAuth();

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_reminders")
        .select("*")
        .eq("task_id", taskId);

      if (error) throw error;
      return data as Reminder[];
    },
  });

  const addReminderMutation = useMutation({
    mutationFn: async (reminderTime: Date) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("task_reminders")
        .insert({
          task_id: taskId,
          user_id: user.id,
          reminder_type: "email", // Changed from "notification" to "email"
          reminder_time: reminderTime.toISOString(),
        });

      if (error) {
        console.error("Error adding reminder:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", taskId] });
      setDate(undefined);
      toast({
        title: "Reminder set",
        description: "You will be notified at the specified time.",
      });
    },
    onError: (error) => {
      console.error("Failed to set reminder:", error);
      toast({
        title: "Error",
        description: "Failed to set reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("task_reminders")
        .delete()
        .eq("id", reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", taskId] });
      toast({
        title: "Reminder deleted",
        description: "The reminder has been removed.",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <CustomPopover
          trigger={
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          }
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </CustomPopover>
        <Button 
          onClick={() => date && addReminderMutation.mutate(date)}
          disabled={!date || addReminderMutation.isPending}
        >
          Set Reminder
        </Button>
      </div>

      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div key={reminder.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              <span>{format(new Date(reminder.reminder_time), "PPP 'at' p")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteReminderMutation.mutate(reminder.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
