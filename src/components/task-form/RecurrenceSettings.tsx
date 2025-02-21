
import React from "react";
import { format } from "date-fns";
import { RecurrencePattern } from "@/types/task";
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
}

export function RecurrenceSettings({
  enabled,
  onEnableChange,
  pattern,
  onPatternChange,
  interval,
  onIntervalChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: RecurrenceSettingsProps) {
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Repeat every</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min={1}
                  value={interval || 1}
                  onChange={(e) => onIntervalChange(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <Select
                  value={pattern || "daily"}
                  onValueChange={(value) => onPatternChange(value as RecurrencePattern)}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start date</Label>
              <DatePicker
                date={startDate}
                onSelect={onStartDateChange}
              />
            </div>
            <div className="space-y-2">
              <Label>End date (optional)</Label>
              <DatePicker
                date={endDate}
                onSelect={onEndDateChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
