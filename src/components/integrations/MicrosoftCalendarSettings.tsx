
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
        setIsConnected(!!profile?.microsoft_refresh_token);

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
        toast({
          title: "Error",
          description: "Failed to load integration settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

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
            <div className="text-sm text-green-600 dark:text-green-400 mb-2">
              ✓ Connected to Microsoft Calendar
            </div>
          ) : (
            <ConnectButton userId={user.id} />
          )}
          {isConnected && (
            <SyncToggle 
              userId={user.id}
              syncEnabled={syncEnabled}
              onSyncChange={setSyncEnabled}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
