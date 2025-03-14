
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  daily_digest: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_preference: string;
  timezone: string;
  notification_settings: NotificationSettings;
}

export const UserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      
      // Parse the JSON notification_settings
      let notificationSettings: NotificationSettings;
      try {
        notificationSettings = typeof data.notification_settings === 'string' 
          ? JSON.parse(data.notification_settings)
          : data.notification_settings;
      } catch (e) {
        // Fallback to default values if parsing fails
        notificationSettings = {
          email: true,
          push: true,
          daily_digest: false
        };
      }
      
      // Transform the data with properly typed notification settings
      const transformedData: UserProfile = {
        ...data,
        notification_settings: {
          email: notificationSettings?.email ?? true,
          push: notificationSettings?.push ?? true,
          daily_digest: notificationSettings?.daily_digest ?? false,
        },
      };
      
      return transformedData;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      // Transform notification_settings back to JSON if it's being updated
      const updatesToSend = {
        ...updates,
        notification_settings: updates.notification_settings 
          ? JSON.stringify(updates.notification_settings)
          : undefined
      };

      const { error } = await supabase
        .from("user_profiles")
        .update(updatesToSend)
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          defaultValue={profile?.full_name || ""}
          onChange={(e) => updateProfileMutation.mutate({ full_name: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="emailNotifications">Email Notifications</Label>
            <Switch
              id="emailNotifications"
              checked={profile?.notification_settings.email}
              onCheckedChange={(checked) =>
                updateProfileMutation.mutate({
                  notification_settings: {
                    ...profile?.notification_settings,
                    email: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="pushNotifications">Push Notifications</Label>
            <Switch
              id="pushNotifications"
              checked={profile?.notification_settings.push}
              onCheckedChange={(checked) =>
                updateProfileMutation.mutate({
                  notification_settings: {
                    ...profile?.notification_settings,
                    push: checked,
                  },
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="dailyDigest">Daily Digest</Label>
            <Switch
              id="dailyDigest"
              checked={profile?.notification_settings.daily_digest}
              onCheckedChange={(checked) =>
                updateProfileMutation.mutate({
                  notification_settings: {
                    ...profile?.notification_settings,
                    daily_digest: checked,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
