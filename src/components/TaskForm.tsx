
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  TaskTag,
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

  const { data: allTasks = [] } = useQuery({
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
      return data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as TaskPriority,
        status: task.status as TaskStatus,
        dueDate: task.due_date,
        createdAt: task.created_at,
        dependencies: [],
        categoryIds: task.category_ids,
        subtasks: [],
        tags: [],
        eventType: task.event_type as EventType,
        startTime: task.start_time,
        endTime: task.end_time,
        isAllDay: task.is_all_day,
        location: task.location,
        attendees: task.attendees as Attendee[],
        recurrencePattern: task.recurrence_pattern,
        recurrenceInterval: task.recurrence_interval,
        recurrenceStartDate: task.recurrence_start_date,
        recurrenceEndDate: task.recurrence_end_date,
        nextOccurrence: task.next_occurrence,
        lastOccurrence: task.last_occurrence,
        scheduleStartDate: task.schedule_start_date,
        weeklyRecurrenceDays: task.weekly_recurrence_days,
        monthlyRecurrenceType: task.monthly_recurrence_type,
        monthlyRecurrenceDay: task.monthly_recurrence_day,
        reminderMinutes: task.reminder_minutes,
        onlineMeetingUrl: task.online_meeting_url,
        sensitivity: task.sensitivity,
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
