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
import { Button } from "@/components/ui/button";
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

const DAYS_OF_WEEK: { label: string; value: WeekDay; shortLabel: string }[] = [
  { label: "Sunday", value: "sunday", shortLabel: "Sun" },
  { label: "Monday", value: "monday", shortLabel: "Mon" },
  { label: "Tuesday", value: "tuesday", shortLabel: "Tue" },
  { label: "Wednesday", value: "wednesday", shortLabel: "Wed" },
  { label: "Thursday", value: "thursday", shortLabel: "Thu" },
  { label: "Friday", value: "friday", shortLabel: "Fri" },
  { label: "Saturday", value: "saturday", shortLabel: "Sat" },
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
  const [selectedPattern, setSelectedPattern] = React.useState<RecurrencePattern>(pattern);

  React.useEffect(() => {
    setSelectedPattern(pattern);
  }, [pattern]);

  const handleWeeklyDayToggle = (day: WeekDay) => {
    const newDays = weeklyDays.includes(day)
      ? weeklyDays.filter(d => d !== day)
      : [...weeklyDays, day];
    onWeeklyDaysChange(newDays);
  };

  const handlePatternChange = (value: RecurrencePattern) => {
    setSelectedPattern(value);
    onPatternChange(value);

    switch (value) {
      case "weekly":
        if (weeklyDays.length === 0) {
          const today = new Date().getDay();
          onWeeklyDaysChange([DAYS_OF_WEEK[today].value]);
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
          <div className="flex items-center space-x-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            <Label className="whitespace-nowrap">Repeat every</Label>
            <Input
              type="number"
              min={1}
              value={interval}
              onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Select
              value={selectedPattern}
              onValueChange={handlePatternChange}
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

          {selectedPattern === "weekly" && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(({ label, value, shortLabel }) => (
                  <Button
                    key={value}
                    type="button"
                    variant={weeklyDays.includes(value) ? "default" : "outline"}
                    onClick={() => handleWeeklyDayToggle(value)}
                    className="w-16"
                    size="sm"
                  >
                    {shortLabel}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedPattern === "monthly" && (
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
