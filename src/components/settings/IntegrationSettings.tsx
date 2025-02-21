import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MicrosoftCalendarSettings } from "@/components/integrations/MicrosoftCalendarSettings";

export const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <MicrosoftCalendarSettings />
      
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
              <p className="text-sm text-muted-foreground">
                Connect additional services to enhance your task management experience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
