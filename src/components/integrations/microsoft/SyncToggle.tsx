
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { SyncStatusLabel } from "./components/SyncStatusLabel";
import { handleTokenRefreshError, initiateSync, updateIntegrationSettings } from "./utils/syncUtils";

interface SyncToggleProps {
  userId: string;
  syncEnabled: boolean;
  onSyncChange: (enabled: boolean) => void;
}

export function SyncToggle({ userId, syncEnabled, onSyncChange }: SyncToggleProps) {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

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

        const { data: testData, error: testError } = await supabase.functions.invoke('calendar-sync', {
          body: { userId, action: 'test-connection' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (testError || testData?.error) {
          console.error('Test connection error:', testError || testData?.error);
          if (testData?.error?.includes('Failed to refresh Microsoft access token') || 
              testError?.message?.includes('Failed to refresh Microsoft access token')) {
            await handleTokenRefreshError(userId, toast, onSyncChange);
            return;
          }
          throw new Error('Failed to verify Microsoft Calendar connection');
        }
      }

      await updateIntegrationSettings(userId, enabled);

      onSyncChange(enabled);
      toast({
        title: enabled ? "Sync Enabled" : "Sync Disabled",
        description: enabled 
          ? "Your tasks will now sync with Microsoft Calendar" 
          : "Task synchronization has been disabled",
      });

      if (enabled) {
        setIsSyncing(true);
        await initiateSync(userId, toast, onSyncChange);
      }
    } catch (error) {
      console.error("Error updating sync settings:", error);
      // Check if the error is related to token refresh
      if (error.message?.includes('Failed to refresh Microsoft access token')) {
        await handleTokenRefreshError(userId, toast, onSyncChange);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update sync settings",
          variant: "destructive",
        });
      }
      onSyncChange(!enabled);
    } finally {
      setIsSyncing(false);
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
      <SyncStatusLabel isSyncing={isSyncing} />
    </div>
  );
}
