
import React from "react";
import { RecurrencePattern } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Repeat } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecurrencePatternSelectorProps {
  pattern: RecurrencePattern;
  onPatternChange: (pattern: RecurrencePattern) => void;
  interval: number;
  onIntervalChange: (interval: number) => void;
}

export function RecurrencePatternSelector({
  pattern,
  onPatternChange,
  interval,
  onIntervalChange,
}: RecurrencePatternSelectorProps) {
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onIntervalChange(value);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Repeat className="h-4 w-4 text-muted-foreground" />
      <Label className="whitespace-nowrap">Repeat every</Label>
      <Input
        type="number"
        min={1}
        value={interval}
        onChange={handleIntervalChange}
        className="w-20"
      />
      <Select
        value={pattern}
        onValueChange={onPatternChange}
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
  );
}
