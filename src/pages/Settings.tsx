
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
import {
  Bell,
  User,
  Shield,
  Palette,
  Globe,
  CalendarDays,
  HelpCircle,
  FileText,
  ListTodo
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationSettings, setNotificationSettings] = React.useState({
    email: true,
    push: true,
    inApp: true
  });

  const handleNotificationChange = async (key: keyof typeof notificationSettings) => {
    try {
      const newSettings = { ...notificationSettings, [key]: !notificationSettings[key] };
      setNotificationSettings(newSettings);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_settings: {
            email: newSettings.email,
            push: newSettings.push,
            in_app: newSettings.inApp
          }
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences and account settings.</p>
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
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
                <RadioGroup defaultValue="normal" className="flex gap-4">
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive task updates via email.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email}
                  onCheckedChange={() => handleNotificationChange('email')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about tasks on your device.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.push}
                  onCheckedChange={() => handleNotificationChange('push')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    See notifications within the app.
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.inApp}
                  onCheckedChange={() => handleNotificationChange('inApp')}
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
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Microsoft 365 Calendar</Label>
                  <p className="text-sm text-muted-foreground">
                    Sync your tasks with Microsoft Calendar.
                  </p>
                </div>
                <Button variant="outline">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between">
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
