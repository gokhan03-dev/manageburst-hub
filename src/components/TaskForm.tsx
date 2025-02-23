import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  Attendee,
  RecurrencePattern,
  WeekDay,
  MonthlyRecurrenceType,
  TaskTag,
} from "@/types/task";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { TaskBasicInfo } from "./task-form/TaskBasicInfo";
import { TaskTiming } from "./task-form/TaskTiming";
import { TaskManagement } from "./task-form/TaskManagement";
import { ReminderSettings } from "./task-form/ReminderSettings";
import { MeetingTimeSettings } from "./task-form/MeetingTimeSettings";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { RecurrenceControls } from "./task-form/RecurrenceControls";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  taskType: EventType;
  onCancel: () => void;
}

interface Subtask {
  text: string;
  completed: boolean;
}

const transformDatabaseTask = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description || "",
  priority: dbTask.priority as TaskPriority,
  status: dbTask.status as TaskStatus,
  dueDate: dbTask.due_date || new Date().toISOString(),
  createdAt: dbTask.created_at,
  dependencies: [],
  categoryIds: dbTask.category_ids || [],
  subtasks: [],
  tags: [],
  eventType: dbTask.event_type as EventType,
  startTime: dbTask.start_time,
  endTime: dbTask.end_time,
  isAllDay: dbTask.is_all_day,
  location: dbTask.location,
  attendees: (dbTask.attendees as any[] || []).map(a => ({ 
    email: a.email, 
    required: a.required 
  })),
  recurrencePattern: dbTask.recurrence_pattern as RecurrencePattern,
  recurrenceInterval: dbTask.recurrence_interval,
  recurrenceStartDate: dbTask.recurrence_start_date,
  recurrenceEndDate: dbTask.recurrence_end_date,
  weeklyRecurrenceDays: dbTask.weekly_recurrence_days as WeekDay[],
  monthlyRecurrenceType: dbTask.monthly_recurrence_type as MonthlyRecurrenceType,
  monthlyRecurrenceDay: dbTask.monthly_recurrence_day,
  reminderMinutes: dbTask.reminder_minutes,
  onlineMeetingUrl: dbTask.online_meeting_url,
});

export const TaskForm = ({ onSubmit, initialData, taskType, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [tags, setTags] = useState<TaskTag[]>(initialData?.tags || []);
  const [attendees, setAttendees] = useState<Attendee[]>(initialData?.attendees || []);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      ...initialData || {
        title: "",
        description: "",
        priority: "low" as TaskPriority,
        status: "todo" as TaskStatus,
        dueDate: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 30 * 60000).toISOString(),
        reminderMinutes: 15,
        subtasks: [],
        dependencies: [],
        categoryIds: [],
        recurrencePattern: undefined as RecurrencePattern | undefined,
        recurrenceInterval: 1,
        recurrenceStartDate: undefined,
        recurrenceEndDate: undefined,
        weeklyRecurrenceDays: [] as WeekDay[],
        monthlyRecurrenceType: undefined as MonthlyRecurrenceType | undefined,
        monthlyRecurrenceDay: undefined,
      },
    },
  });

  const handleFormSubmit = async (data: any) => {
    if (taskType === 'meeting' && attendees.length > 0) {
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
      tags,
      subtasks,
    });
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <TaskBasicInfo
        register={register}
        setValue={setValue}
        defaultPriority={watch('priority')}
        dueDate={watch('dueDate')}
        taskType={taskType}
      />

      {(!isEditMode || (isEditMode && taskType === 'task')) && taskType === 'task' && (
        <div className="space-y-6">
          <TaskTiming
            priority={watch('priority')}
            dueDate={watch('dueDate')}
            recurrenceEnabled={recurrenceEnabled}
            reminderEnabled={reminderEnabled}
            onPriorityChange={(value) => setValue("priority", value)}
            onDueDateChange={(date) => setValue("dueDate", date?.toISOString())}
            onRecurrenceToggle={setRecurrenceEnabled}
            onReminderToggle={setReminderEnabled}
          />

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
                    weeklyDays={watch("weeklyRecurrenceDays") || []}
                    onWeeklyDaysChange={(days) => setValue("weeklyRecurrenceDays", days)}
                    monthlyType={watch("monthlyRecurrenceType")}
                    onMonthlyTypeChange={(type) => setValue("monthlyRecurrenceType", type)}
                    monthlyDay={watch("monthlyRecurrenceDay") || 1}
                    onMonthlyDayChange={(day) => setValue("monthlyRecurrenceDay", day)}
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
            tags={tags}
            subtasks={subtasks}
            onAddTag={(tag) => setTags([...tags, tag])}
            onRemoveTag={(id) => setTags(tags.filter(t => t.id !== id))}
            onAddSubtask={(text) => setSubtasks([...subtasks, { text, completed: false }])}
            onToggleSubtask={(index) => setSubtasks(subtasks.map((subtask, i) => 
              i === index ? { ...subtask, completed: !subtask.completed } : subtask
            ))}
            onRemoveSubtask={(index) => setSubtasks(subtasks.filter((_, i) => i !== index))}
          />
        </div>
      )}

      {(!isEditMode || (isEditMode && taskType === 'meeting')) && taskType === 'meeting' && (
        <>
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
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? 'Update' : 'Create'} {taskType}
        </Button>
      </div>
    </form>
  );
};
