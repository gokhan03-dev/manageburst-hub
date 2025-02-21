
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Check, CloudOff, CloudSync, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface SyncStatusProps {
  taskId: string;
}

export function SyncStatus({ taskId }: SyncStatusProps) {
  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['taskSyncStatus', taskId],
    queryFn: async () => {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('microsoft_event_id, updated_at')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError;

      const { data: settings, error: settingsError } = await supabase
        .from('integration_settings')
        .select('sync_enabled, last_sync_time, last_sync_status')
        .eq('integration_type', 'microsoft_calendar')
        .single();

      if (settingsError) throw settingsError;

      return {
        isSynced: !!task?.microsoft_event_id,
        lastSyncTime: settings?.last_sync_time,
        syncEnabled: settings?.sync_enabled,
        syncStatus: settings?.last_sync_status,
        lastUpdate: task?.updated_at,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!syncStatus?.syncEnabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CloudOff className="h-5 w-5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Calendar sync is disabled</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusIcon = () => {
    if (!syncStatus.isSynced) {
      return <CloudSync className="h-5 w-5 text-yellow-500 animate-spin" />;
    }
    
    if (syncStatus.syncStatus === 'error') {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    }
    
    return <Check className="h-5 w-5 text-green-500" />;
  };

  const getTooltipContent = () => {
    if (!syncStatus.isSynced) {
      return "Waiting to sync with calendar";
    }
    
    if (syncStatus.syncStatus === 'error') {
      return "Last sync attempt failed";
    }
    
    return `Last synced: ${syncStatus.lastSyncTime ? 
      format(new Date(syncStatus.lastSyncTime), 'MMM d, yyyy HH:mm:ss') : 
      'Never'}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {getStatusIcon()}
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
