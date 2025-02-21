
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncPayload {
  userId: string;
  direction: 'push' | 'pull';
}

async function refreshMicrosoftToken(refreshToken: string) {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Microsoft OAuth credentials not configured');
  }

  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error:', errorData);
      throw new Error('Failed to refresh Microsoft token: ' + (errorData.error_description || 'Unknown error'));
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh Microsoft access token. Please reconnect your Microsoft account.');
  }
}

async function createCalendarEvent(accessToken: string, task: any) {
  try {
    const event = {
      subject: task.title,
      body: {
        contentType: "text",
        content: task.description || "",
      },
      start: {
        dateTime: task.due_date || new Date().toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: task.due_date || new Date().toISOString(),
        timeZone: "UTC",
      },
      reminderMinutesBefore: task.reminder_minutes || 15,
    };

    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Create event error:', errorData);
      throw new Error('Failed to create calendar event: ' + (errorData.error?.message || 'Unknown error'));
    }

    return await response.json();
  } catch (error) {
    console.error('Create event error:', error);
    throw new Error('Failed to create calendar event. Please check your Microsoft Calendar permissions.');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, direction } = await req.json() as SyncPayload;

    // Validate input
    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Starting sync for user:', userId, 'direction:', direction);

    // Get user's Microsoft refresh token
    const { data: userData, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('microsoft_refresh_token')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User profile error:', userError);
      throw new Error('Failed to fetch user profile');
    }

    if (!userData?.microsoft_refresh_token) {
      throw new Error('Microsoft account not connected. Please connect your account first.');
    }

    console.log('Refreshing Microsoft token...');
    const accessToken = await refreshMicrosoftToken(userData.microsoft_refresh_token);
    console.log('Token refreshed successfully');

    if (direction === 'push') {
      // Get tasks that need to be synced
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('microsoft_event_id', null);

      if (tasksError) {
        console.error('Tasks fetch error:', tasksError);
        throw new Error('Failed to fetch tasks for sync');
      }

      console.log(`Found ${tasks?.length || 0} tasks to sync`);

      // Push tasks to Microsoft Calendar
      const syncPromises = (tasks || []).map(async (task) => {
        try {
          console.log('Syncing task:', task.id);
          const event = await createCalendarEvent(accessToken, task);
          
          // Update task with Microsoft event ID
          await supabaseClient
            .from('tasks')
            .update({ microsoft_event_id: event.id })
            .eq('id', task.id);
          
          return { success: true, taskId: task.id };
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
          return { success: false, taskId: task.id, error };
        }
      });

      const results = await Promise.all(syncPromises);
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        console.error('Some tasks failed to sync:', failed);
      }
    }

    // Update last sync time
    await supabaseClient
      .from('integration_settings')
      .update({
        last_sync_time: new Date().toISOString(),
        last_sync_status: 'success'
      })
      .eq('user_id', userId)
      .eq('integration_type', 'microsoft_calendar');

    return new Response(
      JSON.stringify({ 
        message: 'Calendar sync completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Sync error:', error);
    
    // Update sync status to error
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { userId } = await req.json() as SyncPayload;
      if (userId) {
        await supabaseClient
          .from('integration_settings')
          .update({
            last_sync_time: new Date().toISOString(),
            last_sync_status: 'error'
          })
          .eq('user_id', userId)
          .eq('integration_type', 'microsoft_calendar');
      }
    } catch (updateError) {
      console.error('Failed to update sync status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during sync'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
