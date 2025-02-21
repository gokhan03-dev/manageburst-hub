
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsState } from "@/types/settings";

interface NotificationSettingsProps {
  settings: SettingsState;
  onSettingChange: (category: keyof SettingsState, key: string, value: any) => void;
}

export const NotificationSettings = ({ settings, onSettingChange }: NotificationSettingsProps) => {
  return (
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
            onCheckedChange={(checked) => onSettingChange('notifications', 'email', checked)}
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
            onCheckedChange={(checked) => onSettingChange('notifications', 'push', checked)}
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
            onCheckedChange={(checked) => onSettingChange('notifications', 'inApp', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
