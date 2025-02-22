
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
  const handleDayClick = (day: WeekDay) => {
    onDayToggle(day);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS_OF_WEEK.map(({ label, value, shortLabel }) => {
        const isSelected = selectedDays.includes(value);
        return (
          <Button
            key={value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            onClick={() => handleDayClick(value)}
            className={`w-16 transition-all ${
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
            size="sm"
          >
            {shortLabel}
          </Button>
        );
      })}
    </div>
  );
}
