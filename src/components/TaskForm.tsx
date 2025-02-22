
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  Attendee,
  TaskTag,
} from "@/types/task";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { MeetingSettings } from "./task-form/MeetingSettings";
import { TaskBasicInfo } from "./task-form/sections/TaskBasicInfo";
import { TaskCategories } from "./task-form/sections/TaskCategories";
import { TaskTags } from "./task-form/sections/TaskTags";
import { TaskSubtasks } from "./task-form/sections/TaskSubtasks";
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

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      subtasks,
      tags,
      dependencies: initialData?.dependencies || [],
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
