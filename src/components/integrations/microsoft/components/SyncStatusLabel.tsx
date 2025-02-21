
import { SyncLoadingIndicator } from "./SyncLoadingIndicator";

interface SyncStatusLabelProps {
  isSyncing: boolean;
}

export function SyncStatusLabel({ isSyncing }: SyncStatusLabelProps) {
  return (
    <label htmlFor="sync-enabled" className="text-sm flex items-center gap-2">
      Enable task synchronization
      {isSyncing && <SyncLoadingIndicator />}
    </label>
  );
}
