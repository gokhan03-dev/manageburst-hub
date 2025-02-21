
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CustomPopover } from "@/components/ui/custom-popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export const DatePicker = ({ date, onSelect }: DatePickerProps) => {
  return (
    <CustomPopover
      trigger={
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      }
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelect}
        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        initialFocus
      />
    </CustomPopover>
  );
};
