
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskStatus,
  EventType,
  Attendee,
  RecurrencePattern,
} from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { TaskBasicInfo } from "./task-form/TaskBasicInfo";
import { MeetingTimeSettings } from "./task-form/MeetingTimeSettings";
import { RecurrenceControls } from "./task-form/RecurrenceControls";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { ReminderSettings } from "./task-form/ReminderSettings";

interface MeetingFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  onCancel: () => void;
}

export const MeetingForm = ({ onSubmit, initialData, onCancel }: MeetingFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>(initialData?.attendees || []);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      ...initialData || {
        title: "",
        description: "",
        status: "todo" as TaskStatus,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
        reminderMinutes: 15,
        recurrencePattern: undefined as RecurrencePattern | undefined,
        recurrenceInterval: 1,
        recurrenceStartDate: undefined,
        recurrenceEndDate: undefined,
      },
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (attendees.length > 0) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const organizerName = userData.user?.email || "Meeting Organizer";

        await supabase.functions.invoke('send-bulk-meeting-invites', {
          body: {
            attendees,
            meetingTitle: data.title,
            startTime: data.startTime,
            endTime: data.endTime,
            description: data.description,
            location: data.location,
            organizerName,
          },
        });

        toast({
          title: "Meeting invitations sent",
          description: `Successfully sent invitations to ${attendees.length} attendee(s)`,
        });
      } catch (error) {
        console.error('Error sending invitations:', error);
        toast({
          title: "Failed to send invitations",
          description: "There was an error sending the meeting invitations",
          variant: "destructive",
        });
      }
    }

    onSubmit({
      ...data,
      attendees,
      eventType: "meeting",
    });
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <TaskBasicInfo
        register={register}
        setValue={setValue}
        defaultPriority="low"
        dueDate={watch('startTime')}
        taskType="meeting"
      />

      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <MeetingTimeSettings
            startTime={watch('startTime')}
            endTime={watch('endTime')}
            onStartTimeChange={(date) => setValue('startTime', date?.toISOString())}
            onEndTimeChange={(date) => setValue('endTime', date?.toISOString())}
            onDurationChange={(duration) => {
              const startTimeValue = watch('startTime');
              if (!startTimeValue) {
                toast({
                  title: "Please select a start time first",
                  variant: "destructive",
                });
                return;
              }
              try {
                const startTime = new Date(startTimeValue);
                const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);
                setValue('endTime', endTime.toISOString());
              } catch (error) {
                console.error('Error calculating end time:', error);
                toast({
                  title: "Error setting meeting duration",
                  description: "Please try selecting the start time again",
                  variant: "destructive",
                });
              }
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <RecurrenceControls
            recurrenceEnabled={recurrenceEnabled}
            reminderEnabled={reminderEnabled}
            onRecurrenceToggle={setRecurrenceEnabled}
            onReminderToggle={setReminderEnabled}
          />
        </div>
      </div>

      {(recurrenceEnabled || reminderEnabled) && (
        <div className="space-y-4">
          {recurrenceEnabled && (
            <div className="pl-4 border-l-2 border-primary/20">
              <RecurrenceSettings
                enabled={recurrenceEnabled}
                onEnableChange={setRecurrenceEnabled}
                pattern={watch("recurrencePattern")}
                onPatternChange={(pattern) => setValue("recurrencePattern", pattern)}
                interval={watch("recurrenceInterval")}
                onIntervalChange={(interval) => setValue("recurrenceInterval", interval)}
                startDate={watch("recurrenceStartDate") ? new Date(watch("recurrenceStartDate")) : undefined}
                onStartDateChange={(date) => setValue("recurrenceStartDate", date?.toISOString())}
                endDate={watch("recurrenceEndDate") ? new Date(watch("recurrenceEndDate")) : undefined}
                onEndDateChange={(date) => setValue("recurrenceEndDate", date?.toISOString())}
              />
            </div>
          )}

          {reminderEnabled && (
            <ReminderSettings
              reminderMinutes={watch("reminderMinutes")}
              onReminderChange={(value) => setValue("reminderMinutes", value)}
            />
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? 'Update' : 'Create'} Meeting
        </Button>
      </div>
    </form>
  );
};
