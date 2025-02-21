
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SideNav } from "@/components/SideNav";
import { TaskProvider } from "@/contexts/TaskContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { IntegrationSettings } from "@/components/settings/IntegrationSettings";
import { SettingsState, DatabaseUserProfile } from "@/types/settings";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<SettingsState>({
    notifications: {
      email: true,
      push: true,
      inApp: true
    },
    appearance: {
      fontSize: 'normal'
    }
  });
  const [isDirty, setIsDirty] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      const profile = profileData as DatabaseUserProfile;
      if (profile?.notification_settings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          notifications: {
            email: profile.notification_settings.email ?? true,
            push: profile.notification_settings.push ?? true,
            inApp: profile.notification_settings.in_app ?? true
          }
        }));
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleSettingChange = (
    category: keyof SettingsState,
    key: string,
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setIsDirty(true);
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_settings: {
            email: settings.notifications.email,
            push: settings.notifications.push,
            in_app: settings.notifications.inApp
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully."
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <TaskProvider>
      <FilterProvider>
        <div className="flex min-h-screen bg-background">
          <SideNav />
          <div className="flex-1 lg:ml-64">
            <div className="container max-w-5xl py-8">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground">
                    Manage your app preferences and account settings.
                  </p>
                </div>
                {isDirty && (
                  <Button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="mt-4 sm:mt-0"
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>

              <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <AppearanceSettings
                    settings={settings}
                    onSettingChange={handleSettingChange}
                  />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <NotificationSettings
                    settings={settings}
                    onSettingChange={handleSettingChange}
                  />
                </TabsContent>

                <TabsContent value="account" className="space-y-4">
                  <AccountSettings user={user} />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                  <IntegrationSettings />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </FilterProvider>
    </TaskProvider>
  );
};

export default Settings;
