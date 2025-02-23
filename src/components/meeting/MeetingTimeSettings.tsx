
import React from "react";
import { DatePicker } from "@/components/task-form/DatePicker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

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
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const durations = [
    "15 min",
    "30 min",
    "45 min",
    "1 hour",
    "1.5 hours",
    "2 hours",
    "2.5 hours",
    "3 hours",
  ];

  const formatTimeDisplay = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  const handleStartTimeSelect = (time: string) => {
    if (!startTime) return;
    const [hours, minutes] = time.split(":");
    const newDate = new Date(startTime);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    onStartTimeChange(newDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label>Date</Label>
            <DatePicker
              date={startTime ? new Date(startTime) : undefined}
              onSelect={onStartTimeChange}
            />
          </div>

          <div className="flex-1">
            <Label>Start Time</Label>
            <Select
              value={startTime ? format(new Date(startTime), "HH:mm") : undefined}
              onValueChange={handleStartTimeSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start time">
                  {startTime ? formatTimeDisplay(startTime) : "Select start time"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time</SelectLabel>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {format(new Date(`2000-01-01 ${time}`), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Duration</Label>
            <Select onValueChange={onDurationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Duration</SelectLabel>
                  {durations.map((duration) => (
                    <SelectItem
                      key={duration}
                      value={duration.split(" ")[0].replace(".", "")}
                    >
                      {duration}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {startTime && endTime && (
        <div className="text-sm text-muted-foreground">
          Meeting ends at {formatTimeDisplay(endTime)}
        </div>
      )}
    </div>
  );
};
