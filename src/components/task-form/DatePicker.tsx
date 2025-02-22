
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CustomPopover } from "@/components/ui/custom-popover";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  showTimePicker?: boolean;
  placeholder?: string;
}

export function DatePicker({ date, onSelect, showTimePicker, placeholder }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [selectedTime, setSelectedTime] = React.useState(
    date ? format(date, "HH:mm") : "00:00"
  );
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    setIsOpen(false);
    
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
    if (selectedDate) {
      const [hours, minutes] = e.target.value.split(":").map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes);
      onSelect(newDate);
    }
  };

  React.useEffect(() => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(format(date, "HH:mm"));
    }
  }, [date]);

  return (
    <div className="flex gap-2">
      <CustomPopover
        open={isOpen}
        onOpenChange={setIsOpen}
        align="start"
        trigger={
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, showTimePicker ? "dd MMM yyyy" : "dd MMM yyyy") : <span>{placeholder || "Pick a date"}</span>}
          </Button>
        }
        className="p-0 w-auto bg-popover"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
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
};
