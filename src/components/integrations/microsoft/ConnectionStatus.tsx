
import { Button } from "@/components/ui/button";
import { ConnectButton } from "./ConnectButton";
import { SyncToggle } from "./SyncToggle";

interface ConnectionStatusProps {
  isConnected: boolean;
  userId: string;
  syncEnabled: boolean;
  onSyncChange: (enabled: boolean) => void;
  onDisconnect: () => void;
  isDisconnecting: boolean;
}

export function ConnectionStatus({
  isConnected,
  userId,
  syncEnabled,
  onSyncChange,
  onDisconnect,
  isDisconnecting,
}: ConnectionStatusProps) {
  return (
    <div className="flex flex-col space-y-4">
      {isConnected ? (
        <>
          <div className="text-sm text-green-600 dark:text-green-400 mb-2">
            ✓ Connected to Microsoft Calendar
          </div>
          <SyncToggle 
            userId={userId}
            syncEnabled={syncEnabled}
            onSyncChange={onSyncChange}
          />
          <Button 
            variant="destructive" 
            onClick={onDisconnect}
            disabled={isDisconnecting}
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect Microsoft Calendar"}
          </Button>
        </>
      ) : (
        <ConnectButton userId={userId} />
      )}
    </div>
  );
}
