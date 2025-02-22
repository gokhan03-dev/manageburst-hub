
import React from "react";
import { MonthlyRecurrenceType } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    <div className="space-y-4">
      <RadioGroup
        value={monthlyType}
        onValueChange={(value) => onMonthlyTypeChange(value as MonthlyRecurrenceType)}
        className="gap-4"
      >
        <Card className={cn(
          "transition-all hover:border-primary cursor-pointer",
          monthlyType === "date" && "border-primary"
        )}>
          <CardContent className="p-4 flex items-center space-x-2">
            <RadioGroupItem value="date" id="monthly-date" />
            <div className="flex items-center gap-2">
              <span>Day</span>
              <Input
                type="number"
                min={1}
                max={31}
                value={monthlyDay}
                onChange={(e) => onMonthlyDayChange(parseInt(e.target.value) || 1)}
                className="w-20"
                disabled={monthlyType !== "date"}
              />
              <span>of the month</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "transition-all hover:border-primary cursor-pointer",
          monthlyType === "end-of-month" && "border-primary"
        )}>
          <CardContent className="p-4 flex items-center space-x-2">
            <RadioGroupItem value="end-of-month" id="monthly-end" />
            <Label htmlFor="monthly-end">End of month</Label>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  );
}
