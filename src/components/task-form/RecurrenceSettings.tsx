
import React from "react";
import { RecurrencePattern, WeekDay, MonthlyRecurrenceType } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "./DatePicker";
import { WeeklyDaySelector } from "./WeeklyDaySelector";
import { MonthlySettings } from "./MonthlySettings";
import { RecurrencePatternSelector } from "./RecurrencePatternSelector";

const WEEKDAYS: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

interface RecurrenceSettingsProps {
  enabled: boolean;
  onEnableChange: (enabled: boolean) => void;
  pattern?: RecurrencePattern;
  onPatternChange: (pattern: RecurrencePattern) => void;
  interval?: number;
  onIntervalChange: (interval: number) => void;
  startDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  endDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
  weeklyDays?: WeekDay[];
  onWeeklyDaysChange?: (days: WeekDay[]) => void;
  monthlyType?: MonthlyRecurrenceType;
  onMonthlyTypeChange?: (type: MonthlyRecurrenceType) => void;
  monthlyDay?: number;
  onMonthlyDayChange?: (day: number) => void;
}

export function RecurrenceSettings({
  enabled,
  onEnableChange,
  pattern = "daily",
  onPatternChange,
  interval = 1,
  onIntervalChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  weeklyDays = [],
  onWeeklyDaysChange = () => {},
  monthlyType = "date",
  onMonthlyTypeChange = () => {},
  monthlyDay = 1,
  onMonthlyDayChange = () => {},
}: RecurrenceSettingsProps) {
  const [selectedPattern, setSelectedPattern] = React.useState<RecurrencePattern>(pattern);
  const [localWeeklyDays, setLocalWeeklyDays] = React.useState<WeekDay[]>(weeklyDays);

  React.useEffect(() => {
    setSelectedPattern(pattern);
  }, [pattern]);

  React.useEffect(() => {
    setLocalWeeklyDays(weeklyDays);
  }, [weeklyDays]);

  const handleWeeklyDayToggle = (day: WeekDay) => {
    const newDays = localWeeklyDays.includes(day)
      ? localWeeklyDays.filter(d => d !== day)
      : [...localWeeklyDays, day];
    setLocalWeeklyDays(newDays);
    onWeeklyDaysChange(newDays);
  };

  const handlePatternChange = (value: RecurrencePattern) => {
    setSelectedPattern(value);
    onPatternChange(value);

    switch (value) {
      case "weekly":
        if (weeklyDays.length === 0) {
          const today = new Date().getDay();
          const newDays = [WEEKDAYS[today]];
          setLocalWeeklyDays(newDays);
          onWeeklyDaysChange(newDays);
        }
        break;
      case "monthly":
        onMonthlyTypeChange("date");
        if (!monthlyDay || monthlyDay < 1) {
          onMonthlyDayChange(new Date().getDate());
        }
        break;
      case "yearly":
        if (!startDate) {
          onStartDateChange(new Date());
        }
        break;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {!enabled && (
        <div className="flex items-center space-x-2">
          <Switch 
            checked={enabled}
            onCheckedChange={onEnableChange}
            id="recurrence-switch"
          />
          <Label htmlFor="recurrence-switch">Make this a recurring task</Label>
        </div>
      )}

      {enabled && (
        <div className="space-y-4">
          <RecurrencePatternSelector
            pattern={selectedPattern}
            onPatternChange={handlePatternChange}
            interval={interval}
            onIntervalChange={onIntervalChange}
          />

          {selectedPattern === "weekly" && (
            <WeeklyDaySelector
              selectedDays={localWeeklyDays}
              onDayToggle={handleWeeklyDayToggle}
            />
          )}

          {selectedPattern === "monthly" && (
            <MonthlySettings
              monthlyType={monthlyType}
              onMonthlyTypeChange={onMonthlyTypeChange}
              monthlyDay={monthlyDay}
              onMonthlyDayChange={onMonthlyDayChange}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              date={startDate}
              onSelect={onStartDateChange}
              placeholder="Start date"
            />
            <DatePicker
              date={endDate}
              onSelect={onEndDateChange}
              placeholder="End date (optional)"
            />
          </div>
        </div>
      )}
    </div>
  );
}
