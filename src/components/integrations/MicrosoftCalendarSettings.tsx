
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConnectionStatus } from "./microsoft/ConnectionStatus";
import { useMicrosoftCalendar } from "@/hooks/useMicrosoftCalendar";

export function MicrosoftCalendarSettings() {
  const { user } = useAuth();
  const {
    syncEnabled,
    setSyncEnabled,
    isLoading,
    isConnected,
    isDisconnecting,
    handleDisconnect,
  } = useMicrosoftCalendar(user?.id);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Microsoft Calendar</CardTitle>
        <CardDescription>
          Sync your tasks with Microsoft Calendar to keep track of deadlines and schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectionStatus
          isConnected={isConnected}
          userId={user.id}
          syncEnabled={syncEnabled}
          onSyncChange={setSyncEnabled}
          onDisconnect={handleDisconnect}
          isDisconnecting={isDisconnecting}
        />
      </CardContent>
    </Card>
  );
}
