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
import { Json } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "./task-form/CategorySelect";
import { TagList } from "./task-form/TagList";
import { SubtaskList } from "./task-form/SubtaskList";
import { DependencySelect } from "./task-form/DependencySelect";
import { MeetingSettings } from "./task-form/MeetingSettings";
import { TaskBasicInfo } from "./task-form/TaskBasicInfo";
import { MeetingTimeSettings } from "./task-form/MeetingTimeSettings";
import { RecurrenceControls } from "./task-form/RecurrenceControls";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "./task-form/DatePicker";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { Repeat, Bell, Settings } from "lucide-react";

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
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [tags, setTags] = useState<TaskTag[]>(initialData?.tags || []);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categoryIds || []);
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

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at');
      
      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return tasksData.map(transformDatabaseTask);
    },
  });

  const handleAddCategory = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
  };

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
      dependencies: watch('dependencies') || [],
      categoryIds: selectedCategories,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <Input
          {...register("title", { required: true })}
          placeholder={`${taskType} title`}
          className="text-lg"
        />

        <Textarea
          {...register("description")}
          placeholder="Description"
          className="min-h-[100px]"
        />

        {taskType === 'meeting' ? (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <DatePicker
                  date={initialData?.startTime ? new Date(initialData.startTime) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setValue("startTime", date.toISOString());
                      const endDate = new Date(date.getTime() + 30 * 60000);
                      setValue("endTime", endDate.toISOString());
                    } else {
                      setValue("startTime", undefined);
                      setValue("endTime", undefined);
                    }
                  }}
                  showTimePicker={true}
                />
              </div>
              <div className="w-[150px]">
                <Select
                  value={watch('endTime') ? 
                    String(Math.round((new Date(watch('endTime')).getTime() - new Date(watch('startTime')).getTime()) / 60000)) : 
                    "30"
                  }
                  onValueChange={(value) => setValue('endTime', new Date(new Date(watch('startTime')).getTime() + parseInt(value) * 60000).toISOString())}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="25">25 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-md p-2",
                    recurrenceEnabled && "bg-primary/20 text-primary"
                  )}
                  onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-md p-2",
                    reminderEnabled && "bg-primary/20 text-primary"
                  )}
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {recurrenceEnabled && (
              <div className="bg-muted p-4 rounded-lg">
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
              <div className="bg-muted p-4 rounded-lg">
                <Select 
                  defaultValue={watch("reminderMinutes")?.toString() || "15"}
                  onValueChange={(value) => setValue("reminderMinutes", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reminder time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <MeetingSettings
              attendees={attendees}
              isOnlineMeeting={isOnlineMeeting}
              onOnlineMeetingChange={setIsOnlineMeeting}
              onDurationChange={(duration) => {
                const startTime = new Date(watch('startTime'));
                const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);
                setValue('endTime', endTime.toISOString());
              }}
              onLocationChange={(location) => setValue('location', location)}
              onMeetingUrlChange={(url) => setValue('onlineMeetingUrl', url)}
              onAddAttendee={(email) => setAttendees([...attendees, { email, required: true }])}
              onRemoveAttendee={(email) => setAttendees(attendees.filter(a => a.email !== email))}
              onUpdateAttendeeResponse={(email, response) => {
                setAttendees(attendees.map(a => 
                  a.email === email ? { ...a, response } : a
                ));
              }}
              meetingTitle={watch('title')}
              startTime={watch('startTime')}
              endTime={watch('endTime')}
              description={watch('description')}
              location={watch('location')}
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <div className="w-1/4 space-y-2">
                <Label>Priority</Label>
                <PrioritySelect
                  defaultValue={initialData?.priority || "low"}
                  onValueChange={(value: TaskPriority) => setValue("priority", value)}
                />
              </div>

              <div className="w-1/3 space-y-2">
                <Label>Deadline</Label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    date={initialData?.dueDate ? new Date(initialData.dueDate) : undefined}
                    onSelect={(date) => setValue("dueDate", date?.toISOString())}
                  />
                </div>
              </div>
            </div>

            <CategorySelect
              categories={categories}
              selectedCategories={selectedCategories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
              onOpenDialog={() => setCategoryDialogOpen(true)}
            />

            <div className="space-y-2">
              <TagList
                tags={tags}
                onAddTag={(tag) => setTags([...tags, tag])}
                onRemoveTag={(id) => setTags(tags.filter(t => t.id !== id))}
              />
            </div>

            <div className="space-y-2">
              <SubtaskList
                subtasks={subtasks}
                onAddSubtask={(text) => setSubtasks([...subtasks, { text, completed: false }])}
                onToggleSubtask={(index) => setSubtasks(subtasks.map((subtask, i) => 
                  i === index ? { ...subtask, completed: !subtask.completed } : subtask
                ))}
                onRemoveSubtask={(index) => setSubtasks(subtasks.filter((_, i) => i !== index))}
              />
            </div>
          </>
        )}

        <DependencySelect
          tasks={allTasks}
          selectedDependencies={watch("dependencies") || []}
          onDependencyChange={(dependencies) => setValue("dependencies", dependencies)}
          currentTaskId={initialData?.id}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update" : "Create"} {taskType}
        </Button>
      </div>
    </form>
  );
};
