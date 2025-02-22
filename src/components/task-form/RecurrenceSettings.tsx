
import React from "react";
import { format } from "date-fns";
import { RecurrencePattern, WeekDay, MonthlyRecurrenceType } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "./DatePicker";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Repeat } from "lucide-react";

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

const DAYS_OF_WEEK: { label: string; value: WeekDay }[] = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Tuesday", value: "tuesday" },
  { label: "Wednesday", value: "wednesday" },
  { label: "Thursday", value: "thursday" },
  { label: "Friday", value: "friday" },
  { label: "Saturday", value: "saturday" },
];

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
  const handleWeeklyDayToggle = (day: WeekDay) => {
    const newDays = weeklyDays.includes(day)
      ? weeklyDays.filter(d => d !== day)
      : [...weeklyDays, day];
    onWeeklyDaysChange(newDays);
  };

  // Set default weekday if none selected
  React.useEffect(() => {
    if (pattern === "weekly" && weeklyDays.length === 0) {
      const today = new Date().getDay();
      const defaultDay = DAYS_OF_WEEK[today].value;
      onWeeklyDaysChange([defaultDay]);
    }
  }, [pattern, weeklyDays, onWeeklyDaysChange]);

  // Set default monthly day if none selected
  React.useEffect(() => {
    if (pattern === "monthly" && !monthlyDay) {
      onMonthlyDayChange(new Date().getDate());
    }
  }, [pattern, monthlyDay, onMonthlyDayChange]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center space-x-2">
        <Switch 
          checked={enabled}
          onCheckedChange={onEnableChange}
          id="recurrence-switch"
        />
        <Label htmlFor="recurrence-switch">Make this a recurring task</Label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <Label>Repeat every</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Select
                value={pattern}
                onValueChange={(value) => {
                  onPatternChange(value as RecurrencePattern);
                  if (value === "weekly") {
                    const today = new Date().getDay();
                    onWeeklyDaysChange([DAYS_OF_WEEK[today].value]);
                  } else if (value === "monthly") {
                    onMonthlyDayChange(new Date().getDate());
                    onMonthlyTypeChange("date");
                  }
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Days</SelectItem>
                  <SelectItem value="weekly">Weeks</SelectItem>
                  <SelectItem value="monthly">Months</SelectItem>
                  <SelectItem value="yearly">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pattern === "weekly" && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map(({ label, value }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${value}`}
                      checked={weeklyDays.includes(value)}
                      onCheckedChange={() => handleWeeklyDayToggle(value)}
                    />
                    <Label htmlFor={`day-${value}`}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pattern === "monthly" && (
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
