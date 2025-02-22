
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  TaskTag,
  Attendee,
  RecurrencePattern,
  WeekDay,
  MonthlyRecurrenceType,
  Sensitivity,
} from "@/types/task";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { TaskBasicInfo } from "./task-form/sections/TaskBasicInfo";
import { TaskCategories } from "./task-form/sections/TaskCategories";
import { TaskTags } from "./task-form/sections/TaskTags";
import { TaskSubtasks } from "./task-form/sections/TaskSubtasks";
import { TaskDependencies } from "./task-form/sections/TaskDependencies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type DatabaseTask = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  created_at: string;
  category_ids: string[] | null;
  event_type: string | null;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  location: string | null;
  attendees: any[] | null;
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  recurrence_start_date: string | null;
  recurrence_end_date: string | null;
  next_occurrence: string | null;
  last_occurrence: string | null;
  schedule_start_date: string | null;
  reminder_minutes: number | null;
  online_meeting_url: string | null;
  sensitivity: string | null;
  weekly_recurrence_days: string[] | null;
  monthly_recurrence_type: string | null;
  monthly_recurrence_day: number | null;
};

export const TaskForm = ({ onSubmit, initialData, taskType, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
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

  const { data: allTasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
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
      
      // Transform the data to match our Task type
      return (data as DatabaseTask[]).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: (task.priority || "medium") as TaskPriority,
        status: (task.status || "todo") as TaskStatus,
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
        attendees: ((task.attendees || []) as Array<{ email: string; required: boolean }>)
          .map(a => ({ email: a.email, required: a.required })),
        recurrencePattern: (task.recurrence_pattern as RecurrencePattern) || undefined,
        recurrenceInterval: task.recurrence_interval || undefined,
        recurrenceStartDate: task.recurrence_start_date || undefined,
        recurrenceEndDate: task.recurrence_end_date || undefined,
        nextOccurrence: task.next_occurrence || undefined,
        lastOccurrence: task.last_occurrence || undefined,
        scheduleStartDate: task.schedule_start_date || undefined,
        weeklyRecurrenceDays: (task.weekly_recurrence_days as WeekDay[]) || undefined,
        monthlyRecurrenceType: (task.monthly_recurrence_type as MonthlyRecurrenceType) || undefined,
        monthlyRecurrenceDay: task.monthly_recurrence_day || undefined,
        reminderMinutes: task.reminder_minutes || undefined,
        onlineMeetingUrl: task.online_meeting_url || undefined,
        sensitivity: (task.sensitivity || "normal") as Sensitivity,
      }));
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
      <TaskBasicInfo
        taskType={taskType}
        register={register}
        setValue={setValue}
        initialData={initialData}
        watch={watch}
        recurrenceEnabled={recurrenceEnabled}
        setRecurrenceEnabled={setRecurrenceEnabled}
        reminderEnabled={reminderEnabled}
        setReminderEnabled={setReminderEnabled}
      />

      {recurrenceEnabled && (
        <div className="bg-muted p-4 rounded-lg">
          <RecurrenceSettings
            enabled={recurrenceEnabled}
            onEnableChange={setRecurrenceEnabled}
            pattern={initialData?.recurrencePattern}
            onPatternChange={(pattern) => setValue("recurrencePattern", pattern)}
            interval={initialData?.recurrenceInterval}
            onIntervalChange={(interval) => setValue("recurrenceInterval", interval)}
            startDate={initialData?.recurrenceStartDate ? new Date(initialData.recurrenceStartDate) : undefined}
            onStartDateChange={(date) => setValue("recurrenceStartDate", date?.toISOString())}
            endDate={initialData?.recurrenceEndDate ? new Date(initialData.recurrenceEndDate) : undefined}
            onEndDateChange={(date) => setValue("recurrenceEndDate", date?.toISOString())}
          />
        </div>
      )}

      {reminderEnabled && (
        <div className="bg-muted p-4 rounded-lg">
          <Select 
            defaultValue="15"
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

      <TaskCategories
        categories={categories}
        watch={watch}
        setValue={setValue}
        categoryDialogOpen={categoryDialogOpen}
        setCategoryDialogOpen={setCategoryDialogOpen}
      />

      <TaskTags tags={tags} setTags={setTags} />

      <TaskDependencies
        tasks={allTasks}
        selectedDependencies={watch('dependencies') || []}
        onDependencyChange={(dependencies) => setValue('dependencies', dependencies)}
      />

      {taskType === 'task' && (
        <TaskSubtasks subtasks={subtasks} setSubtasks={setSubtasks} />
      )}

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
