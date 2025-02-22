
import React from "react";
import { MonthlyRecurrenceType } from "@/types/task";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MonthlySettingsProps {
  monthlyType: MonthlyRecurrenceType;
  onMonthlyTypeChange: (type: MonthlyRecurrenceType) => void;
  monthlyDay: number;
  onMonthlyDayChange: (day: number) => void;
}

export function MonthlySettings({
  monthlyType,
  onMonthlyTypeChange,
  monthlyDay,
  onMonthlyDayChange,
}: MonthlySettingsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div 
        className={cn(
          "rounded-full px-4 py-2 cursor-pointer transition-all flex items-center gap-2",
          monthlyType === "date" 
            ? "bg-foreground text-background" 
            : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onMonthlyTypeChange("date")}
      >
        <Input
          type="number"
          min={1}
          max={31}
          value={monthlyDay}
          onChange={(e) => onMonthlyDayChange(parseInt(e.target.value) || 1)}
          className={cn(
            "w-12 h-8 px-2 text-center",
            monthlyType === "date" 
              ? "bg-transparent border-white text-background placeholder:text-background focus-visible:ring-white" 
              : "bg-background border-input"
          )}
          disabled={monthlyType !== "date"}
        />
        <span>day of month</span>
      </div>

      <div 
        className={cn(
          "rounded-full px-4 py-2 cursor-pointer transition-all",
          monthlyType === "end-of-month" 
            ? "bg-foreground text-background" 
            : "bg-background border border-input hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onMonthlyTypeChange("end-of-month")}
      >
        End of month
      </div>
    </div>
  );
}
