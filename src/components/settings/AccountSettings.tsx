
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface AccountSettingsProps {
  user: User;
}

export const AccountSettings = ({ user }: AccountSettingsProps) => {
  return (
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
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline">Change Password</Button>
      </CardContent>
    </Card>
  );
};
