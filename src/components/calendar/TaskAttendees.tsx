
import React from "react";
import { Attendee, AttendeeResponse } from "@/types/task";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskAttendeesProps {
  attendees: Attendee[];
  onAddAttendee: () => void;
  onRemoveAttendee: (email: string) => void;
  onUpdateAttendeeResponse: (email: string, response: AttendeeResponse) => void;
}

export function TaskAttendees({
  attendees,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateAttendeeResponse,
}: TaskAttendeesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Attendees</Label>
        <Button variant="outline" size="sm" onClick={onAddAttendee}>
          <Plus className="h-4 w-4 mr-1" />
          Add Attendee
        </Button>
      </div>
      <div className="space-y-2">
        {attendees?.map((attendee) => (
          <div key={attendee.email} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex-1">
              <p className="text-sm font-medium">{attendee.email}</p>
              <Select 
                value={attendee.response || "tentative"}
                onValueChange={(value) => onUpdateAttendeeResponse(attendee.email, value as AttendeeResponse)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="tentative">Tentative</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRemoveAttendee(attendee.email)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
