
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MicrosoftTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, action, direction } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        }
      }
    )

    // Get user's Microsoft refresh token
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('microsoft_refresh_token')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.microsoft_refresh_token) {
      throw new Error('Failed to get Microsoft refresh token')
    }

    // Exchange refresh token for access token
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('MICROSOFT_CLIENT_ID') || '',
        client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET') || '',
        refresh_token: profile.microsoft_refresh_token,
        grant_type: 'refresh_token',
        scope: 'Calendars.ReadWrite offline_access',
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token refresh failed:', errorText)
      throw new Error('Failed to refresh Microsoft access token')
    }

    const tokens: MicrosoftTokenResponse = await tokenResponse.json()

    // Update the refresh token in the database
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        microsoft_refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update refresh token:', updateError)
      throw new Error('Failed to update refresh token')
    }

    // If this is just a test connection, return success
    if (action === 'test-connection') {
      return new Response(
        JSON.stringify({ message: 'Connection successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get tasks that need to be synced
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('microsoft_event_id', null)
      .in('event_type', ['meeting', 'reminder'])

    if (tasksError) {
      throw new Error('Failed to fetch tasks')
    }

    // Create calendar events for each task
    const syncPromises = tasks.map(async (task) => {
      try {
        const event = {
          subject: task.title,
          body: {
            content: task.description || '',
            contentType: 'text',
          },
          start: {
            dateTime: task.start_time || task.due_date,
            timeZone: 'UTC',
          },
          end: {
            dateTime: task.end_time || task.due_date,
            timeZone: 'UTC',
          },
        }

        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })

        if (!response.ok) {
          throw new Error(`Failed to create event: ${await response.text()}`)
        }

        const eventData = await response.json()

        // Update task with Microsoft event ID
        await supabaseAdmin
          .from('tasks')
          .update({ 
            microsoft_event_id: eventData.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)

      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error)
        return { taskId: task.id, error: error.message }
      }
    })

    const results = await Promise.all(syncPromises)
    const failedTasks = results.filter(result => result?.error)

    // Update last sync status
    await supabaseAdmin
      .from('integration_settings')
      .update({ 
        last_sync_time: new Date().toISOString(),
        last_sync_status: failedTasks.length > 0 ? 'partial' : 'success'
      })
      .eq('user_id', userId)
      .eq('integration_type', 'microsoft_calendar')

    return new Response(
      JSON.stringify({
        message: 'Sync completed',
        failedTasks: failedTasks.length > 0 ? failedTasks : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
