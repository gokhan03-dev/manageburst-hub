
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, Link2 } from "lucide-react";
import { TaskAttendees } from "../calendar/TaskAttendees";
import { Attendee } from "@/types/task";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MeetingSettingsProps {
  attendees: Attendee[];
  isOnlineMeeting: boolean;
  onOnlineMeetingChange: (isOnline: boolean) => void;
  onDurationChange: (duration: string) => void;
  onLocationChange: (location: string) => void;
  onMeetingUrlChange: (url: string | undefined) => void;
  onAddAttendee: () => void;
  onRemoveAttendee: (email: string) => void;
  onUpdateAttendeeResponse: (email: string, response: string) => void;
}

export const MeetingSettings = ({
  attendees,
  isOnlineMeeting,
  onOnlineMeetingChange,
  onDurationChange,
  onLocationChange,
  onMeetingUrlChange,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateAttendeeResponse,
}: MeetingSettingsProps) => {
  return (
    <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
      <div>
        <Label>Duration</Label>
        <Select 
          defaultValue="30"
          onValueChange={onDurationChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Attendees
        </Label>
        <TaskAttendees
          attendees={attendees}
          onAddAttendee={onAddAttendee}
          onRemoveAttendee={onRemoveAttendee}
          onUpdateAttendeeResponse={onUpdateAttendeeResponse}
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant={isOnlineMeeting ? "default" : "outline"}
          onClick={() => {
            onOnlineMeetingChange(true);
            onLocationChange("online");
          }}
          className="flex-1"
        >
          <Link2 className="h-4 w-4 mr-2" />
          Online
        </Button>
        <Button
          type="button"
          variant={!isOnlineMeeting ? "default" : "outline"}
          onClick={() => {
            onOnlineMeetingChange(false);
            onLocationChange("");
            onMeetingUrlChange(undefined);
          }}
          className="flex-1"
        >
          <Users className="h-4 w-4 mr-2" />
          In Person
        </Button>
      </div>

      {isOnlineMeeting && (
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Zoom meeting link will be generated</p>
        </div>
      )}
    </div>
  );
};
