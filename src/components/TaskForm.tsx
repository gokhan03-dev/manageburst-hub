
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  EventType,
  WeekDay,
  MonthlyRecurrenceType,
} from "@/types/task";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTaskContext } from "@/contexts/TaskContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { DependencySelect } from "./task-form/DependencySelect";
import { CategorySelect } from "./task-form/CategorySelect";
import { PrioritySelect } from "./task-form/PrioritySelect";
import { DatePicker } from "./task-form/DatePicker";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";
import { Repeat, Bell, Plus, X } from "lucide-react";
import { TaskAttendees } from "./calendar/TaskAttendees";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  taskType: EventType;
}

export const TaskForm = ({ onSubmit, initialData, taskType }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]); // For simple subtask list
  const [newSubtask, setNewSubtask] = useState("");
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [isOnlineMeeting, setIsOnlineMeeting] = useState(true);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "low" as TaskPriority,
      status: "todo" as TaskStatus,
      dueDate: new Date().toISOString(),
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

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const renderTaskFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Task Title</Label>
        <Input {...register("title", { required: true })} placeholder="Enter task title" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Enter task description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <PrioritySelect
            defaultValue={initialData?.priority || "low"}
            onValueChange={(value: TaskPriority) => setValue("priority", value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Deadline</Label>
          <DatePicker
            date={initialData?.dueDate ? new Date(initialData.dueDate) : undefined}
            onSelect={(date) => setValue("dueDate", date?.toISOString())}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
        >
          <Repeat className={cn("h-4 w-4", recurrenceEnabled && "text-primary")} />
          Recurrence
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setReminderEnabled(!reminderEnabled)}
        >
          <Bell className={cn("h-4 w-4", reminderEnabled && "text-primary")} />
          Reminder
        </Button>
      </div>

      {recurrenceEnabled && (
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
      )}

      <div className="space-y-2">
        <Label>Subtasks</Label>
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask"
            onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
          />
          <Button type="button" size="icon" onClick={handleAddSubtask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
              <span className="flex-1">{subtask}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSubtask(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMeetingFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Meeting Title</Label>
        <Input {...register("title", { required: true })} placeholder="Enter meeting title" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Enter meeting description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <DatePicker
            date={startTime}
            onSelect={setStartTime}
            showTimePicker
          />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <DatePicker
            date={endTime}
            onSelect={setEndTime}
            showTimePicker
          />
        </div>
      </div>

      <TaskAttendees
        attendees={initialData?.attendees || []}
        onAddAttendee={() => {}}
        onRemoveAttendee={() => {}}
        onUpdateAttendeeResponse={() => {}}
      />

      <div className="space-y-2">
        <Label>Meeting Type</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={isOnlineMeeting ? "default" : "outline"}
            onClick={() => setIsOnlineMeeting(true)}
          >
            Online
          </Button>
          <Button
            type="button"
            variant={!isOnlineMeeting ? "default" : "outline"}
            onClick={() => setIsOnlineMeeting(false)}
          >
            In Person
          </Button>
        </div>
      </div>

      {isOnlineMeeting && (
        <div className="space-y-2">
          <Label>Meeting Link</Label>
          <Input {...register("onlineMeetingUrl")} placeholder="Enter meeting link" />
        </div>
      )}

      {!isOnlineMeeting && (
        <div className="space-y-2">
          <Label>Location</Label>
          <Input {...register("location")} placeholder="Enter meeting location" />
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setRecurrenceEnabled(!recurrenceEnabled)}
      >
        <Repeat className={cn("h-4 w-4", recurrenceEnabled && "text-primary")} />
        Recurring Meeting
      </Button>

      {recurrenceEnabled && (
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
      )}
    </div>
  );

  const renderReminderFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Reminder Title</Label>
        <Input {...register("title", { required: true })} placeholder="Enter reminder title" />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Enter reminder description" />
      </div>

      <div className="space-y-2">
        <Label>Reminder Date & Time</Label>
        <DatePicker
          date={initialData?.dueDate ? new Date(initialData.dueDate) : undefined}
          onSelect={(date) => setValue("dueDate", date?.toISOString())}
          showTimePicker
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
      {taskType === "task" && renderTaskFields()}
      {taskType === "meeting" && renderMeetingFields()}
      {taskType === "reminder" && renderReminderFields()}

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
      />

      {taskType !== "reminder" && (
        <DependencySelect
          tasks={[]} // You'll need to pass the tasks here
          selectedDependencies={initialData?.dependencies || []}
          initialTaskId={initialData?.id}
          onAddDependency={(taskId) => {
            const currentDeps = watch("dependencies") || [];
            setValue("dependencies", [...currentDeps, taskId]);
          }}
          onRemoveDependency={(taskId) => {
            const currentDeps = watch("dependencies") || [];
            setValue(
              "dependencies",
              currentDeps.filter((id) => id !== taskId)
            );
          }}
        />
      )}

      <Button type="submit" className="w-full">
        {initialData ? "Update" : "Create"} {taskType}
      </Button>
    </form>
  );
};
