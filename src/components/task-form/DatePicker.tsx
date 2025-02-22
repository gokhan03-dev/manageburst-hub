
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CustomPopover } from "@/components/ui/custom-popover";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  showTimePicker?: boolean;
}

export function DatePicker({ date, onSelect, showTimePicker }: DatePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  );

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      onSelect(undefined);
      return;
    }

    if (showTimePicker && selectedTime) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      newDate.setHours(hours, minutes);
    }

    onSelect(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
    if (date) {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      onSelect(newDate);
    }
  };

  return (
    <div className="flex gap-2">
      <CustomPopover
        trigger={
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, showTimePicker ? "PPP" : "PP") : <span>Pick a date</span>}
          </Button>
        }
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </CustomPopover>
      {showTimePicker && (
        <Input
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          className="w-[150px]"
        />
      )}
    </div>
  );
}
