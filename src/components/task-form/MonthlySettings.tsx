
import React from "react";
import { MonthlyRecurrenceType } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <div className="space-y-4">
      <Label>Repeat on</Label>
      <RadioGroup 
        value={monthlyType} 
        onValueChange={(value) => onMonthlyTypeChange(value as MonthlyRecurrenceType)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="date" id="monthly-date" />
          <Label htmlFor="monthly-date">Day of month</Label>
          {monthlyType === "date" && (
            <Input
              type="number"
              min={1}
              max={31}
              value={monthlyDay}
              onChange={(e) => onMonthlyDayChange(parseInt(e.target.value) || 1)}
              className="w-20 ml-2"
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="end-of-month" id="monthly-end" />
          <Label htmlFor="monthly-end">End of month</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
