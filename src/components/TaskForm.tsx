
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
  Sensitivity,
  TaskTag,
} from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CategorySelect } from "./task-form/CategorySelect";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { DatePicker } from "./task-form/DatePicker";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { SubtaskList } from "./task-form/SubtaskList";
import { TagList } from "./task-form/TagList";
import { MeetingSettings } from "./task-form/MeetingSettings";
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

interface DatabaseTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  user_id: string;
  category_ids: string[];
  tags: string[];
  event_type: string | null;
  is_all_day: boolean;
  location: string | null;
  attendees: any[];
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  next_occurrence: string | null;
  last_occurrence: string | null;
  schedule_start_date: string | null;
  weekly_recurrence_days: string[] | null;
  monthly_recurrence_type: string | null;
  monthly_recurrence_day: number | null;
  reminder_minutes: number | null;
  online_meeting_url: string | null;
  sensitivity: string | null;
}

export const TaskForm = ({ onSubmit, initialData, taskType, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);
  const [tags, setTags] = useState<TaskTag[]>(initialData?.tags || []);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

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

  const transformDatabaseTask = (task: DatabaseTask): Task => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    priority: task.priority as TaskPriority,
    status: task.status as TaskStatus,
    dueDate: task.due_date || new Date().toISOString(),
    createdAt: task.created_at,
    dependencies: [],
    categoryIds: task.category_ids || [],
    subtasks: [],
    tags: [],
    eventType: (task.event_type || taskType) as EventType,
    startTime: task.start_time || undefined,
    endTime: task.end_time || undefined,
    isAllDay: task.is_all_day || false,
    location: task.location || undefined,
    attendees: task.attendees as Attendee[],
    recurrencePattern: task.recurrence_pattern as RecurrencePattern || undefined,
    recurrenceInterval: task.recurrence_interval || 1,
    recurrenceStartDate: task.recurrence_start_date || undefined,
    recurrenceEndDate: task.recurrence_end_date || undefined,
    nextOccurrence: task.next_occurrence || undefined,
    lastOccurrence: task.last_occurrence || undefined,
    scheduleStartDate: task.schedule_start_date || undefined,
    weeklyRecurrenceDays: task.weekly_recurrence_days as WeekDay[] || [],
    monthlyRecurrenceType: task.monthly_recurrence_type as MonthlyRecurrenceType || undefined,
    monthlyRecurrenceDay: task.monthly_recurrence_day || undefined,
    reminderMinutes: task.reminder_minutes || 15,
    onlineMeetingUrl: task.online_meeting_url || undefined,
    sensitivity: task.sensitivity as Sensitivity || "normal",
  });

  const { data: allTasks = [] } = useQuery<Task[]>({
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
      
      return (tasksData as DatabaseTask[]).map(transformDatabaseTask);
    },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      subtasks,
      tags,
      dependencies: watch('dependencies') || [],
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

        <div className="flex items-center gap-4">
          <div className="w-1/4 space-y-2">
            <Label>Priority</Label>
            <PrioritySelect
              defaultValue={initialData?.priority || "low"}
              onValueChange={(value: TaskPriority) => setValue("priority", value)}
            />
          </div>

          <div className="w-1/3 space-y-2">
            <Label>{taskType === 'meeting' ? 'Meeting Time' : 'Deadline'}</Label>
            <div className="flex items-center gap-2">
              <DatePicker
                date={initialData?.dueDate ? new Date(initialData.dueDate) : undefined}
                onSelect={(date) => {
                  if (taskType === 'meeting') {
                    setValue("startTime", date?.toISOString());
                    if (date) {
                      const endDate = new Date(date.getTime() + 30 * 60000);
                      setValue("endTime", endDate.toISOString());
                    }
                  } else {
                    setValue("dueDate", date?.toISOString());
                  }
                }}
                showTimePicker={taskType === 'meeting'}
              />
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

        <CategorySelect
          categories={categories}
          selectedCategories={initialData?.categoryIds || []}
          onAddCategory={(categoryId) => {
            const currentCategories = watch("categoryIds") || [];
            setValue("categoryIds", [...currentCategories, categoryId]);
          }}
          onRemoveCategory={(categoryId) => {
            const currentCategories = watch("categoryIds") || [];
            setValue(
              "categoryIds",
              currentCategories.filter((id) => id !== categoryId)
            );
          }}
          onOpenDialog={() => setCategoryDialogOpen(true)}
        />

        <div className="space-y-2">
          <TagList
            tags={tags}
            onAddTag={(tag) => setTags([...tags, tag])}
            onRemoveTag={(id) => setTags(tags.filter(t => t.id !== id))}
          />
        </div>

        {taskType === 'task' && (
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
        )}
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
