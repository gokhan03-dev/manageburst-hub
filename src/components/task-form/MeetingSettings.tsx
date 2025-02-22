
import React, { useState, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, X, Check, Clock, MinusCircle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Attendee } from "@/types/task";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
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
  onLocationChange: (location: string) => void;
  onMeetingUrlChange: (url: string | undefined) => void;
  onAddAttendee: (email: string) => void;
  onRemoveAttendee: (email: string) => void;
  onUpdateAttendeeResponse: (email: string, response: 'accepted' | 'tentative' | 'declined') => void;
  meetingTitle?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
}

export const MeetingSettings = ({
  attendees,
  isOnlineMeeting,
  onOnlineMeetingChange,
  onLocationChange,
  onMeetingUrlChange,
  onAddAttendee,
  onRemoveAttendee,
  onUpdateAttendeeResponse,
  location: initialLocation,
}: MeetingSettingsProps) => {
  const [newAttendee, setNewAttendee] = useState("");
  const [locationInput, setLocationInput] = useState(initialLocation || "");
  const [hasZoomIntegration, setHasZoomIntegration] = useState(false);

  useEffect(() => {
    checkZoomIntegration();
  }, []);

  useEffect(() => {
    if (initialLocation) {
      setLocationInput(initialLocation);
    }
  }, [initialLocation]);

  const checkZoomIntegration = async () => {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('zoom_credentials')
        .single();
      
      setHasZoomIntegration(!!userProfile?.zoom_credentials);
    } catch (error) {
      console.error('Error checking Zoom integration:', error);
      setHasZoomIntegration(false);
    }
  };

  const handleIntegrateZoom = () => {
    // This is a placeholder for Zoom integration
    toast({
      title: "Zoom Integration",
      description: "Zoom integration will be implemented in the next phase.",
      variant: "default",
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newAttendee.trim()) {
        onAddAttendee(newAttendee.trim());
        setNewAttendee("");
      }
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'accepted':
        return <Check className="h-3 w-3 text-green-500" />;
      case 'declined':
        return <MinusCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={!isOnlineMeeting ? "default" : "outline"}
          onClick={() => onOnlineMeetingChange(false)}
          className="flex-1"
        >
          In Person
        </Button>
        <Button
          type="button"
          variant={isOnlineMeeting ? "default" : "outline"}
          onClick={() => onOnlineMeetingChange(true)}
          className="flex-1"
        >
          Online
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
            onLocationChange(e.target.value);
          }}
          placeholder={isOnlineMeeting ? "Meeting Link" : "Address"}
          className="flex-1"
        />
        {isOnlineMeeting && (
          <Button
            type="button"
            variant="outline"
            onClick={hasZoomIntegration ? () => {
              const zoomLink = `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`;
              setLocationInput(zoomLink);
              onLocationChange(zoomLink);
              onMeetingUrlChange(zoomLink);
            } : handleIntegrateZoom}
          >
            {hasZoomIntegration ? "Generate Zoom Link" : "Integrate Zoom"}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <Input
            value={newAttendee}
            onChange={(e) => setNewAttendee(e.target.value)}
            placeholder="Add attendee email"
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (newAttendee.trim()) {
                onAddAttendee(newAttendee.trim());
                setNewAttendee("");
              }
            }}
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>

        {attendees.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {attendees.map((attendee) => (
              <Badge
                key={attendee.email}
                variant="outline"
                className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 text-xs bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100/50 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
              >
                {getStatusIcon(attendee.response)}
                {attendee.email}
                <button
                  type="button"
                  onClick={() => onRemoveAttendee(attendee.email)}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
