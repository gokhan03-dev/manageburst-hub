
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SyncToggleProps {
  userId: string;
  syncEnabled: boolean;
  onSyncChange: (enabled: boolean) => void;
}

export function SyncToggle({ userId, syncEnabled, onSyncChange }: SyncToggleProps) {
  const { toast } = useToast();

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      // First, check if a record exists
      const { data: existingSettings } = await supabase
        .from("integration_settings")
        .select("id")
        .eq("user_id", userId)
        .eq("integration_type", "microsoft_calendar")
        .single();

      let error;

      if (existingSettings) {
        // If record exists, update it
        const { error: updateError } = await supabase
          .from("integration_settings")
          .update({
            sync_enabled: enabled,
            is_active: true,
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
    } catch (error) {
      console.error("Error updating sync settings:", error);
      toast({
        title: "Error",
        description: "Failed to update sync settings",
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
      />
      <label htmlFor="sync-enabled" className="text-sm">
        Enable task synchronization
      </label>
    </div>
  );
}
