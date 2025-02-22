
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PrioritySelect } from "../PrioritySelect";
import { TaskPriority, EventType } from "@/types/task";
import { DatePicker } from "../DatePicker";

interface TaskBasicInfoProps {
  taskType: EventType;
  register: any;
  setValue: (name: string, value: any) => void;
  initialData?: any;
  watch: any;
  recurrenceEnabled: boolean;
  setRecurrenceEnabled: (enabled: boolean) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (enabled: boolean) => void;
}

export const TaskBasicInfo = ({
  taskType,
  register,
  setValue,
  initialData,
  watch,
  recurrenceEnabled,
  setRecurrenceEnabled,
  reminderEnabled,
  setReminderEnabled,
}: TaskBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <Input
        {...register("title", { required: true })}
        placeholder={`${taskType} title`}
        className="text-lg"
        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
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
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center space-x-2">
          <Switch
            checked={recurrenceEnabled}
            onCheckedChange={setRecurrenceEnabled}
            id="recurrence-switch"
          />
          <Label htmlFor="recurrence-switch">Recurring {taskType}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
            id="reminder-switch"
          />
          <Label htmlFor="reminder-switch">Set reminder</Label>
        </div>
      </div>
    </div>
  );
};
