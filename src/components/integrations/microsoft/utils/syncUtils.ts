
import { supabase } from "@/integrations/supabase/client";
import type { ToastType } from "@/components/ui/use-toast";

export const handleTokenRefreshError = async (
  userId: string,
  toast: ToastType,
  onSyncChange: (enabled: boolean) => void
) => {
  try {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ microsoft_refresh_token: null })
      .eq("id", userId);

    if (profileError) throw profileError;

    const { error: settingsError } = await supabase
      .from("integration_settings")
      .update({ sync_enabled: false, is_active: false })
      .eq("user_id", userId)
      .eq("integration_type", "microsoft_calendar");

    if (settingsError) throw settingsError;

    toast({
      title: "Connection expired",
      description: "Your Microsoft Calendar connection has expired. Please reconnect.",
      variant: "destructive",
    });

    onSyncChange(false);
  } catch (error) {
    console.error("Error handling token refresh:", error);
    toast({
      title: "Error",
      description: "Failed to handle expired connection",
      variant: "destructive",
    });
  }
};

export const initiateSync = async (
  userId: string,
  toast: ToastType,
  onSyncChange: (enabled: boolean) => void
) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('No active session found');
  }

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
    body: { userId, direction: 'push' },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    console.error('Sync error:', error);
    throw new Error(error.message || 'Failed to synchronize with Microsoft Calendar');
  }

  if (data?.error) {
    console.error('Sync function error:', data.error);
    if (data.error.includes('Failed to refresh Microsoft access token')) {
      await handleTokenRefreshError(userId, toast, onSyncChange);
      return;
    }
    throw new Error(data.error);
  }

  toast({
    title: "Sync Completed",
    description: "Your tasks have been synchronized with Microsoft Calendar",
  });
};

export const updateIntegrationSettings = async (
  userId: string,
  enabled: boolean
) => {
  const { data: existingSettings } = await supabase
    .from("integration_settings")
    .select("id")
    .eq("user_id", userId)
    .eq("integration_type", "microsoft_calendar")
    .maybeSingle();

  let error;

  if (existingSettings) {
    const { error: updateError } = await supabase
      .from("integration_settings")
      .update({
        sync_enabled: enabled,
        is_active: true,
        last_sync_status: null,
      })
      .eq("id", existingSettings.id);
    error = updateError;
  } else {
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
};
