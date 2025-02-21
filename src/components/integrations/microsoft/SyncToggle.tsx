
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
      const { error } = await supabase
        .from("integration_settings")
        .upsert({
          user_id: userId,
          integration_type: "microsoft_calendar",
          sync_enabled: enabled,
          is_active: true,
        });

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
