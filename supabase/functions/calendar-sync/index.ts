
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
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

  const params = new URLSearchParams({
    client_id: clientId!,
    client_secret: clientSecret!,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Microsoft token');
  }

  const data = await response.json();
  return data.access_token;
}

async function createCalendarEvent(accessToken: string, task: any) {
  const event = {
    subject: task.title,
    body: {
      contentType: "text",
      content: task.description || "",
    },
    start: {
      dateTime: task.dueDate,
      timeZone: "UTC",
    },
    end: {
      dateTime: task.dueDate,
      timeZone: "UTC",
    },
    reminderMinutesBefore: task.reminderMinutes || 15,
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
    throw new Error('Failed to create calendar event');
  }

  return await response.json();
}

async function getCalendarEvents(accessToken: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  return await response.json();
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

    // Get user's Microsoft refresh token
    const { data: userData, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('microsoft_refresh_token')
      .eq('id', userId)
      .single();

    if (userError || !userData?.microsoft_refresh_token) {
      throw new Error('Microsoft authentication not found');
    }

    // Refresh access token
    const accessToken = await refreshMicrosoftToken(userData.microsoft_refresh_token);

    if (direction === 'push') {
      // Get tasks that need to be synced
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('microsoft_event_id', null);

      if (tasksError) throw tasksError;

      // Push tasks to Microsoft Calendar
      for (const task of tasks) {
        try {
          const event = await createCalendarEvent(accessToken, task);
          
          // Update task with Microsoft event ID
          await supabaseClient
            .from('tasks')
            .update({ microsoft_event_id: event.id })
            .eq('id', task.id);
        } catch (error) {
          console.error(`Failed to sync task ${task.id}:`, error);
        }
      }
    } else {
      // Pull events from Microsoft Calendar
      const events = await getCalendarEvents(accessToken);
      
      // Process and store new events as tasks
      for (const event of events.value) {
        const { data: existingTask } = await supabaseClient
          .from('tasks')
          .select('id')
          .eq('microsoft_event_id', event.id)
          .single();

        if (!existingTask) {
          await supabaseClient
            .from('tasks')
            .insert({
              user_id: userId,
              title: event.subject,
              description: event.body?.content || '',
              dueDate: event.start.dateTime,
              status: 'todo',
              priority: 'medium',
              microsoft_event_id: event.id,
            });
        }
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
