
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MicrosoftAuthConfig } from "@/types/microsoft";

// Use environment variable or your actual Microsoft client ID
const MICROSOFT_AUTH_CONFIG: MicrosoftAuthConfig = {
  clientId: "04afd4ac-5b4f-4ce5-92c0-b21ac7022d18",
  // Ensure the redirect URI matches exactly what's registered in Azure Portal
  redirectUri: window.location.origin + "/auth/microsoft/callback",
  scopes: [
    "Calendars.ReadWrite",
    "offline_access",
    "openid",
    "profile",
    "email"
  ]
};

export function MicrosoftCalendarSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("integration_settings")
        .select("sync_enabled")
        .eq("user_id", user.id)
        .eq("integration_type", "microsoft_calendar")
        .single();

      if (data) {
        setSyncEnabled(data.sync_enabled);
      }
    };

    loadSettings();
  }, [user]);

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to connect Microsoft Calendar",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    try {
      // Generate state parameter for security
      const stateParam = encodeURIComponent(JSON.stringify({
        userId: user.id,
        timestamp: Date.now()
      }));

      // Construct Microsoft OAuth URL with all necessary parameters
      const authUrl = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
      
      // Add required query parameters
      const params = new URLSearchParams({
        client_id: MICROSOFT_AUTH_CONFIG.clientId,
        response_type: "code",
        redirect_uri: MICROSOFT_AUTH_CONFIG.redirectUri,
        scope: MICROSOFT_AUTH_CONFIG.scopes.join(" "),
        response_mode: "query",
        state: stateParam,
        prompt: "select_account"
      });

      authUrl.search = params.toString();

      // Log the full URL for debugging
      console.log("Microsoft Auth URL:", authUrl.toString());
      console.log("Redirect URI:", MICROSOFT_AUTH_CONFIG.redirectUri);

      // Redirect to Microsoft login
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error connecting to Microsoft:", error);
      toast({
        title: "Error",
        description: "Failed to connect to Microsoft Calendar. Please try again.",
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
            variant="default"
          >
            {isConnecting ? "Connecting..." : "Connect Microsoft Calendar"}
          </Button>

          <div className="flex items-center space-x-2">
            <Switch
              checked={syncEnabled}
              onCheckedChange={handleSyncToggle}
              id="sync-enabled"
            />
            <label htmlFor="sync-enabled" className="text-sm">
              Enable task synchronization
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
