
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Task, TaskStatus } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TaskBasicInfo } from "../task-form/TaskBasicInfo";
import { MeetingTimeSettings } from "./MeetingTimeSettings";
import { MeetingLocationSettings } from "./MeetingLocationSettings";
import { RecurrenceControls } from "../task-form/RecurrenceControls";
import { RecurrenceSettings } from "../task-form/RecurrenceSettings";
import { ReminderSettings } from "../task-form/ReminderSettings";
import { TaskManagement } from "../task-form/TaskManagement";

interface MeetingFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  onCancel: () => void;
}

export const MeetingForm = ({ onSubmit, initialData, onCancel }: MeetingFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(!!initialData?.onlineMeetingUrl);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      ...initialData || {
        title: "",
        description: "",
        status: "todo" as TaskStatus,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
        reminderMinutes: 15,
        categoryIds: [],
        location: "",
        onlineMeetingUrl: "",
      },
    },
  });

  const handleFormSubmit = async (data: any) => {
    onSubmit({
      ...data,
      eventType: "meeting",
    });
  };

  const handleZoomMeeting = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("Not authenticated");
      }

      // Here you would typically call your Zoom API integration
      toast({
        title: "Zoom Integration",
        description: "Zoom integration is not yet implemented",
      });
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      toast({
        title: "Error",
        description: "Failed to create Zoom meeting",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <TaskBasicInfo
        register={register}
        setValue={setValue}
        defaultPriority="low"
        dueDate={watch('startTime')}
        taskType="meeting"
      />

      <div className="space-y-6">
        <MeetingTimeSettings
          startTime={watch('startTime')}
          endTime={watch('endTime')}
          onStartTimeChange={(date) => setValue('startTime', date?.toISOString())}
          onEndTimeChange={(date) => setValue('endTime', date?.toISOString())}
          onDurationChange={(duration) => {
            const startTimeValue = watch('startTime');
            if (!startTimeValue) {
              toast({
                title: "Error setting meeting duration",
                description: "Please select a start time first",
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

        <MeetingLocationSettings
          isOnline={isOnline}
          location={watch(isOnline ? 'onlineMeetingUrl' : 'location')}
          onLocationChange={(value) => setValue(isOnline ? 'onlineMeetingUrl' : 'location', value)}
          onIsOnlineChange={setIsOnline}
          onCreateZoomMeeting={handleZoomMeeting}
        />

        <div className="flex items-center gap-2 justify-end">
          <RecurrenceControls
            recurrenceEnabled={recurrenceEnabled}
            reminderEnabled={reminderEnabled}
            onRecurrenceToggle={setRecurrenceEnabled}
            onReminderToggle={setReminderEnabled}
          />
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

        <TaskManagement
          onAddCategory={(categoryId) => {
            const currentCategories = watch("categoryIds") || [];
            setValue("categoryIds", [...currentCategories, categoryId]);
          }}
          selectedCategoryIds={watch("categoryIds")}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Meeting
        </Button>
      </div>
    </form>
  );
};
