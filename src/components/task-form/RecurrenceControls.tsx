
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Repeat, Bell } from "lucide-react";

interface RecurrenceControlsProps {
  recurrenceEnabled: boolean;
  reminderEnabled: boolean;
  onRecurrenceToggle: (enabled: boolean) => void;
  onReminderToggle: (enabled: boolean) => void;
}

export const RecurrenceControls = ({
  recurrenceEnabled,
  reminderEnabled,
  onRecurrenceToggle,
  onReminderToggle,
}: RecurrenceControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-md p-2",
          recurrenceEnabled && "bg-primary/20 text-primary"
        )}
        onClick={() => onRecurrenceToggle(!recurrenceEnabled)}
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
        onClick={() => onReminderToggle(!reminderEnabled)}
      >
        <Bell className="h-4 w-4" />
      </Button>
    </div>
  );
};
