import React, { useState, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  Attendee,
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
import { Repeat, Bell, Settings, Circle, ListTodo, Tag, TagsIcon } from "lucide-react";

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

interface TaskTag {
  id: string;
  name: string;
  color: string;
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

  const handleMeetingDurationChange = (duration: string) => {
    const startDate = new Date(watch("startTime"));
    const endDate = new Date(startDate.getTime() + parseInt(duration) * 60000);
    setValue("endTime", endDate.toISOString());
  };

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
      <div className="space-y-4">
        <Input
          {...register("title", { required: true })}
          placeholder={`${taskType} title`}
          className="text-lg"
          onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit(handleFormSubmit)();
            }
          }}
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
