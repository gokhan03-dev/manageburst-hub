
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const IntegrationSettings = () => {
  return (
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
  );
};
