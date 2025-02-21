
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useMicrosoftCalendar(userId: string | undefined) {
  const { toast } = useToast();
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // First check if Microsoft is connected
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("microsoft_refresh_token")
          .eq("id", userId)
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
          .eq("user_id", userId)
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
  }, [userId, toast]);

  const handleForceDisconnect = async () => {
    if (!userId) return;
    
    try {
      // Clear the refresh token
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ microsoft_refresh_token: null })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Disable sync settings
      const { error: settingsError } = await supabase
        .from("integration_settings")
        .update({ sync_enabled: false, is_active: false })
        .eq("user_id", userId)
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
    if (!userId) return;
    
    setIsDisconnecting(true);
    try {
      // First disable sync if it's enabled
      if (syncEnabled) {
        const { error: syncError } = await supabase
          .from("integration_settings")
          .update({ sync_enabled: false, is_active: false })
          .eq("user_id", userId)
          .eq("integration_type", "microsoft_calendar");

        if (syncError) throw syncError;
      }

      // Then remove the refresh token
      const { error } = await supabase
        .from("user_profiles")
        .update({ microsoft_refresh_token: null })
        .eq("id", userId);

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

  return {
    syncEnabled,
    setSyncEnabled,
    isLoading,
    isConnected,
    isDisconnecting,
    handleDisconnect,
  };
}
