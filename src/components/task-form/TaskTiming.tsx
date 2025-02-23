
import React from "react";
import { TaskPriority } from "@/types/task";
import { PrioritySelect } from "./PrioritySelect";
import { DatePicker } from "./DatePicker";
import { RecurrenceControls } from "./RecurrenceControls";

interface TaskTimingProps {
  priority: TaskPriority;
  dueDate?: string;
  recurrenceEnabled: boolean;
  reminderEnabled: boolean;
  onPriorityChange: (value: TaskPriority) => void;
  onDueDateChange: (date: Date | undefined) => void;
  onRecurrenceToggle: (enabled: boolean) => void;
  onReminderToggle: (enabled: boolean) => void;
}

export const TaskTiming = ({
  priority,
  dueDate,
  recurrenceEnabled,
  reminderEnabled,
  onPriorityChange,
  onDueDateChange,
  onRecurrenceToggle,
  onReminderToggle,
}: TaskTimingProps) => {
  return (
    <div className="flex items-center gap-4">
      <PrioritySelect
        defaultValue={priority}
        onValueChange={onPriorityChange}
      />

      <DatePicker
        date={dueDate ? new Date(dueDate) : undefined}
        onSelect={onDueDateChange}
      />
      
      <div className="flex items-center justify-end gap-2 flex-1">
        <RecurrenceControls
          recurrenceEnabled={recurrenceEnabled}
          reminderEnabled={reminderEnabled}
          onRecurrenceToggle={onRecurrenceToggle}
          onReminderToggle={onReminderToggle}
        />
      </div>
    </div>
  );
};
