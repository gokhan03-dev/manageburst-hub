
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConnectButton } from "./microsoft/ConnectButton";
import { SyncToggle } from "./microsoft/SyncToggle";

export function MicrosoftCalendarSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // First check if Microsoft is connected
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("microsoft_refresh_token")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        // If no refresh token is found, mark as disconnected
        if (!profile?.microsoft_refresh_token) {
          setIsConnected(false);
          setSyncEnabled(false);
          setIsLoading(false);
          return;
        }

        setIsConnected(true);

        // Then load sync settings
        const { data, error } = await supabase
          .from("integration_settings")
          .select("sync_enabled")
          .eq("user_id", user.id)
          .eq("integration_type", "microsoft_calendar")
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSyncEnabled(data.sync_enabled);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        // If we get a token refresh error, force disconnect
        if (error.message?.includes("Failed to refresh Microsoft access token")) {
          await handleForceDisconnect();
        } else {
          toast({
            title: "Error",
            description: "Failed to load integration settings",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  const handleForceDisconnect = async () => {
    if (!user) return;
    
    try {
      // Clear the refresh token
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ microsoft_refresh_token: null })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Disable sync settings
      const { error: settingsError } = await supabase
        .from("integration_settings")
        .update({ sync_enabled: false, is_active: false })
        .eq("user_id", user.id)
        .eq("integration_type", "microsoft_calendar");

      if (settingsError) throw settingsError;

      setIsConnected(false);
      setSyncEnabled(false);
      toast({
        title: "Connection expired",
        description: "Your Microsoft Calendar connection has expired. Please reconnect.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error force disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to handle expired connection",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    
    setIsDisconnecting(true);
    try {
      // First disable sync if it's enabled
      if (syncEnabled) {
        const { error: syncError } = await supabase
          .from("integration_settings")
          .update({ sync_enabled: false, is_active: false })
          .eq("user_id", user.id)
          .eq("integration_type", "microsoft_calendar");

        if (syncError) throw syncError;
      }

      // Then remove the refresh token
      const { error } = await supabase
        .from("user_profiles")
        .update({ microsoft_refresh_token: null })
        .eq("id", user.id);

      if (error) throw error;

      setIsConnected(false);
      setSyncEnabled(false);
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Microsoft Calendar",
      });
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Microsoft Calendar",
        variant: "destructive",
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

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
          {isConnected ? (
            <>
              <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                ✓ Connected to Microsoft Calendar
              </div>
              <SyncToggle 
                userId={user.id}
                syncEnabled={syncEnabled}
                onSyncChange={setSyncEnabled}
              />
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect Microsoft Calendar"}
              </Button>
            </>
          ) : (
            <ConnectButton userId={user.id} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
