
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SettingsState {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  appearance: {
    fontSize: 'small' | 'normal' | 'large';
  };
}

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
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_settings')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data?.notification_settings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          notifications: {
            email: data.notification_settings.email ?? true,
            push: data.notification_settings.push ?? true,
            inApp: data.notification_settings.in_app ?? true
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

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and account settings.</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the Task Manager looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode.
                  </p>
                </div>
                <ThemeToggle />
              </div>

              <div className="space-y-4">
                <Label>Font Size</Label>
                <RadioGroup 
                  defaultValue="normal"
                  value={settings.appearance.fontSize}
                  onValueChange={(value) => handleSettingChange('appearance', 'fontSize', value)}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">Large</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about your tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive task updates via email.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about tasks on your device.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    See notifications within the app.
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.inApp}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'inApp', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View and update your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Manage your connected applications and services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>Microsoft 365 Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync your tasks with Microsoft Calendar.
                  </p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <Label>Zoom Meetings</Label>
                  <p className="text-sm text-muted-foreground">
                    Create Zoom meetings for your tasks.
                  </p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
