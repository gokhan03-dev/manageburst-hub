
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReminderSettingsProps {
  reminderMinutes: number;
  onReminderChange: (minutes: number) => void;
}

export const ReminderSettings = ({
  reminderMinutes,
  onReminderChange,
}: ReminderSettingsProps) => {
  return (
    <div className="pl-4 border-l-2 border-primary/20">
      <div className="space-y-2">
        <Label>Reminder Time</Label>
        <Select
          value={reminderMinutes?.toString()}
          onValueChange={(value) => onReminderChange(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select reminder time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 minutes before</SelectItem>
            <SelectItem value="10">10 minutes before</SelectItem>
            <SelectItem value="15">15 minutes before</SelectItem>
            <SelectItem value="30">30 minutes before</SelectItem>
            <SelectItem value="60">1 hour before</SelectItem>
            <SelectItem value="1440">1 day before</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
