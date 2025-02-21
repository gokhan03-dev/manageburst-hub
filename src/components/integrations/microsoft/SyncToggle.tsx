
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SyncToggleProps {
  userId: string;
  syncEnabled: boolean;
  onSyncChange: (enabled: boolean) => void;
}

export function SyncToggle({ userId, syncEnabled, onSyncChange }: SyncToggleProps) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const initiateSync = async () => {
    try {
      setIsSyncing(true);
      
      // First verify Microsoft auth is set up
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('microsoft_refresh_token')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw new Error('Failed to verify Microsoft authentication');
      if (!profile?.microsoft_refresh_token) {
        throw new Error('Microsoft Calendar not connected. Please connect first.');
      }

      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { userId, direction: 'push' }
      });

      if (error) {
        console.error('Sync error:', error);
        throw new Error(error.message || 'Failed to synchronize with Microsoft Calendar');
      }

      if (data?.error) {
        console.error('Sync function error:', data.error);
        if (data.error.includes('Failed to refresh Microsoft access token')) {
          throw new Error('Microsoft Calendar connection has expired. Please reconnect.');
        }
        throw new Error(data.error);
      }

      toast({
        title: "Sync Completed",
        description: "Your tasks have been synchronized with Microsoft Calendar",
      });
    } catch (error) {
      console.error("Error during sync:", error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to synchronize with Microsoft Calendar",
        variant: "destructive",
      });
      // Disable sync if there's an error
      handleSyncToggle(false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      // First, check if Microsoft is connected when enabling
      if (enabled) {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('microsoft_refresh_token')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) throw new Error('Failed to verify Microsoft authentication');
        if (!profile?.microsoft_refresh_token) {
          throw new Error('Please connect Microsoft Calendar before enabling sync');
        }

        // Check if the token is valid by making a test API call
        const { data: testData, error: testError } = await supabase.functions.invoke('calendar-sync', {
          body: { userId, action: 'test-connection' }
        });

        if (testError || testData?.error) {
          if ((testError?.message || testData?.error || '').includes('Failed to refresh Microsoft access token')) {
            throw new Error('Microsoft Calendar connection has expired. Please reconnect.');
          }
          throw new Error('Failed to verify Microsoft Calendar connection');
        }
      }

      // Check if a record exists
      const { data: existingSettings } = await supabase
        .from("integration_settings")
        .select("id")
        .eq("user_id", userId)
        .eq("integration_type", "microsoft_calendar")
        .maybeSingle();

      let error;

      if (existingSettings) {
        // If record exists, update it
        const { error: updateError } = await supabase
          .from("integration_settings")
          .update({
            sync_enabled: enabled,
            is_active: true,
            last_sync_status: null, // Reset status
          })
          .eq("id", existingSettings.id);
        error = updateError;
      } else {
        // If no record exists, insert a new one
        const { error: insertError } = await supabase
          .from("integration_settings")
          .insert({
            user_id: userId,
            integration_type: "microsoft_calendar",
            sync_enabled: enabled,
            is_active: true,
          });
        error = insertError;
      }

      if (error) throw error;

      onSyncChange(enabled);
      toast({
        title: enabled ? "Sync Enabled" : "Sync Disabled",
        description: enabled 
          ? "Your tasks will now sync with Microsoft Calendar" 
          : "Task synchronization has been disabled",
      });

      if (enabled) {
        await initiateSync();
      }
    } catch (error) {
      console.error("Error updating sync settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update sync settings",
        variant: "destructive",
      });
      // Revert the toggle state since the operation failed
      onSyncChange(!enabled);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={syncEnabled}
        onCheckedChange={handleSyncToggle}
        id="sync-enabled"
        disabled={isSyncing}
      />
      <label htmlFor="sync-enabled" className="text-sm flex items-center gap-2">
        Enable task synchronization
        {isSyncing && <Loader2 className="h-4 w-4 animate-spin" />}
      </label>
    </div>
  );
}
