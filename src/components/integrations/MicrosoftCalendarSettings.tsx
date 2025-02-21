
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MicrosoftAuthConfig } from "@/types/microsoft";

const MICROSOFT_AUTH_CONFIG: MicrosoftAuthConfig = {
  clientId: "04afd4ac-5b4f-4ce5-92c0-b21ac7022d18",
  redirectUri: `${window.location.origin}/auth/microsoft/callback`,
  scopes: [
    "Calendars.ReadWrite",
    "offline_access"
  ]
};

export function MicrosoftCalendarSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Build Microsoft OAuth URL
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=${MICROSOFT_AUTH_CONFIG.clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(MICROSOFT_AUTH_CONFIG.redirectUri)}` +
        `&scope=${encodeURIComponent(MICROSOFT_AUTH_CONFIG.scopes.join(' '))}` +
        `&response_mode=query` +
        `&state=${user?.id}`;

      // Redirect to Microsoft login
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error connecting to Microsoft:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Microsoft Calendar",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncToggle = async (enabled: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("integration_settings")
        .upsert({
          user_id: user.id,
          integration_type: "microsoft_calendar",
          sync_enabled: enabled,
          is_active: true,
        });

      if (error) throw error;

      setSyncEnabled(enabled);
      toast({
        title: enabled ? "Sync Enabled" : "Sync Disabled",
        description: enabled 
          ? "Your tasks will now sync with Microsoft Calendar" 
          : "Task synchronization has been disabled",
      });
    } catch (error) {
      console.error("Error updating sync settings:", error);
      toast({
        title: "Error",
        description: "Failed to update sync settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Microsoft Calendar</CardTitle>
        <CardDescription>
          Sync your tasks with Microsoft Calendar to keep track of deadlines and schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Microsoft Calendar"}
          </Button>

          <div className="flex items-center space-x-2">
            <Switch
              checked={syncEnabled}
              onCheckedChange={handleSyncToggle}
              id="sync-enabled"
            />
            <label htmlFor="sync-enabled">Enable task synchronization</label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
