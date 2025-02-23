
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Task,
  TaskPriority,
  TaskStatus,
  RecurrencePattern,
  WeekDay,
  MonthlyRecurrenceType,
  TaskTag,
  Subtask,
} from "@/types/task";
import { Button } from "@/components/ui/button";
import { TaskBasicInfo } from "./task-form/TaskBasicInfo";
import { TaskTiming } from "./task-form/TaskTiming";
import { TaskManagement } from "./task-form/TaskManagement";
import { ReminderSettings } from "./task-form/ReminderSettings";
import { RecurrenceSettings } from "./task-form/RecurrenceSettings";

interface TaskFormProps {
  onSubmit: (data: Omit<Task, "id" | "createdAt">) => void;
  initialData?: Task;
  onCancel: () => void;
}

export const TaskForm = ({ onSubmit, initialData, onCancel }: TaskFormProps) => {
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(!!initialData?.recurrencePattern);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialData?.subtasks || []);
  const [tags, setTags] = useState<TaskTag[]>(initialData?.tags || []);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      ...initialData || {
        title: "",
        description: "",
        priority: "low" as TaskPriority,
        status: "todo" as TaskStatus,
        dueDate: new Date().toISOString(),
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
    onSubmit({
      ...data,
      tags,
      subtasks,
      eventType: "task",
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
        taskType="task"
      />

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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditMode ? 'Update' : 'Create'} Task
        </Button>
      </div>
    </form>
  );
};
