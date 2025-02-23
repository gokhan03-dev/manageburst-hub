
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Video } from "lucide-react";

interface MeetingLocationSettingsProps {
  isOnline: boolean;
  location?: string;
  onLocationChange: (location: string) => void;
  onIsOnlineChange: (isOnline: boolean) => void;
  onCreateZoomMeeting?: () => void;
}

export const MeetingLocationSettings = ({
  isOnline,
  location,
  onLocationChange,
  onIsOnlineChange,
  onCreateZoomMeeting,
}: MeetingLocationSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Meeting Type</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="in-person">In Person</Label>
            <Switch
              id="in-person"
              checked={!isOnline}
              onCheckedChange={(checked) => onIsOnlineChange(!checked)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="online">Online</Label>
            <Switch
              id="online"
              checked={isOnline}
              onCheckedChange={onIsOnlineChange}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={isOnline ? "Meeting Link" : "Meeting Location"}
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
        {isOnline && onCreateZoomMeeting && (
          <Button
            type="button"
            variant="outline"
            onClick={onCreateZoomMeeting}
            className="gap-2"
          >
            <Video className="h-4 w-4" />
            Create Zoom Meeting
          </Button>
        )}
      </div>
    </div>
  );
};
