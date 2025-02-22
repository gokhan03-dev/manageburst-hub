
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
  console.log('WeeklyDaySelector - selectedDays:', selectedDays);

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS_OF_WEEK.map(({ label, value, shortLabel }) => {
        const isSelected = selectedDays.includes(value);
        console.log(`Day ${value} - isSelected:`, isSelected);
        
        return (
          <Button
            key={value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            onClick={() => {
              console.log('Button clicked:', value);
              onDayToggle(value);
            }}
            className={`w-16 min-w-[4rem] transition-colors ${
              isSelected 
                ? "bg-primary hover:bg-primary/90 text-primary-foreground ring-2 ring-primary ring-offset-2" 
                : "border-2 hover:border-primary hover:text-primary"
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
