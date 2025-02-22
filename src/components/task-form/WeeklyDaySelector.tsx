
import React from "react";
import { WeekDay } from "@/types/task";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK: { label: string; value: WeekDay; shortLabel: string }[] = [
  { label: "Sunday", value: "sunday", shortLabel: "Sun" },
  { label: "Monday", value: "monday", shortLabel: "Mon" },
  { label: "Tuesday", value: "tuesday", shortLabel: "Tue" },
  { label: "Wednesday", value: "wednesday", shortLabel: "Wed" },
  { label: "Thursday", value: "thursday", shortLabel: "Thu" },
  { label: "Friday", value: "friday", shortLabel: "Fri" },
  { label: "Saturday", value: "saturday", shortLabel: "Sat" },
];

interface WeeklyDaySelectorProps {
  selectedDays: WeekDay[];
  onDayToggle: (day: WeekDay) => void;
}

export function WeeklyDaySelector({ selectedDays, onDayToggle }: WeeklyDaySelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS_OF_WEEK.map(({ label, value, shortLabel }) => (
        <Button
          key={value}
          type="button"
          variant={selectedDays.includes(value) ? "default" : "outline"}
          onClick={() => onDayToggle(value)}
          className={`w-16 transition-all ${
            selectedDays.includes(value) 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
          size="sm"
        >
          {shortLabel}
        </Button>
      ))}
    </div>
  );
}
