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

    const { data: userData, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('microsoft_refresh_token')
      .eq('id', userId)
      .single();

    if (userError || !userData?.microsoft_refresh_token) {
      throw new Error('Microsoft authentication not found');
    }

    const { data: tasks, error: tasksError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .is('microsoft_event_id', null);

    if (tasksError) {
      throw tasksError;
    }

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
        message: 'Calendar sync initiated',
        tasksToSync: tasks.length
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
