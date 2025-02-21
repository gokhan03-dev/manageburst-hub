
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SettingsState } from "@/types/settings";

interface AppearanceSettingsProps {
  settings: SettingsState;
  onSettingChange: (category: keyof SettingsState, key: string, value: any) => void;
}

export const AppearanceSettings = ({ settings, onSettingChange }: AppearanceSettingsProps) => {
  return (
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
            onValueChange={(value) => onSettingChange('appearance', 'fontSize', value)}
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
  );
};
