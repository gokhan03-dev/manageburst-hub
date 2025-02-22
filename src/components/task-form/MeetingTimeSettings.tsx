
import React from "react";
import { DatePicker } from "./DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface MeetingTimeSettingsProps {
  startTime?: string;
  endTime?: string;
  onStartTimeChange: (date: Date | undefined) => void;
  onEndTimeChange: (date: Date | undefined) => void;
  onDurationChange: (duration: string) => void;
}

export const MeetingTimeSettings = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onDurationChange,
}: MeetingTimeSettingsProps) => {
  const calculateDuration = () => {
    if (!startTime || !endTime) return "30";
    return String(
      Math.round(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
      )
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <DatePicker
          date={startTime ? new Date(startTime) : undefined}
          onSelect={(date) => {
            onStartTimeChange(date);
            if (date) {
              const endDate = new Date(date.getTime() + 30 * 60000);
              onEndTimeChange(endDate);
            } else {
              onEndTimeChange(undefined);
            }
          }}
          showTimePicker={true}
        />
      </div>
      <div className="w-[150px]">
        <Select
          value={calculateDuration()}
          onValueChange={onDurationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="20">20 minutes</SelectItem>
            <SelectItem value="25">25 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
