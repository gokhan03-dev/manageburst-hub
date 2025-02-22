
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
    <div className="flex flex-wrap gap-2">
      <div 
        className={cn(
          "h-9 transition-all flex items-center rounded-md text-sm font-medium",
          monthlyType === "date" 
            ? "bg-primary text-primary-foreground" 
            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => onMonthlyTypeChange("date")}
      >
        <div className="flex items-center px-3">
          <Input
            type="number"
            min={1}
            max={31}
            value={monthlyDay}
            onChange={(e) => onMonthlyDayChange(parseInt(e.target.value) || 1)}
            className={cn(
              "w-10 h-7 px-1 text-center border-0 focus-visible:ring-0",
              monthlyType === "date" 
                ? "bg-transparent text-primary-foreground placeholder:text-primary-foreground" 
                : "bg-transparent"
            )}
            disabled={monthlyType !== "date"}
          />
          <span className="pr-3">day of month</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onMonthlyTypeChange("end-of-month")}
        className={cn(
          "h-9 px-3 rounded-md text-sm font-medium transition-all",
          monthlyType === "end-of-month"
            ? "bg-primary text-primary-foreground"
            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        )}
      >
        End of month
      </button>
    </div>
  );
}
