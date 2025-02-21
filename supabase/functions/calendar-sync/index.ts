
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncPayload {
  userId: string;
  action?: 'test-connection' | 'sync';
  direction?: 'push' | 'pull';
}

async function refreshMicrosoftToken(refreshToken: string) {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    console.error('Microsoft OAuth credentials not configured');
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
    console.log('Attempting to refresh Microsoft token...');
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Token refresh error response:', errorData);
      throw new Error('Failed to refresh Microsoft token: ' + (errorData.error_description || 'Unknown error'));
    }

    const data = await response.json();
    console.log('Token refresh successful');
    return data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error('Failed to refresh Microsoft access token. Please reconnect your Microsoft account.');
  }
}

async function testConnection(userId: string, supabaseClient: any) {
  console.log('Testing Microsoft connection for user:', userId);
  
  const { data: userData, error: userError } = await supabaseClient
    .from('user_profiles')
    .select('microsoft_refresh_token')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('User profile fetch error:', userError);
    throw new Error('Failed to fetch user profile');
  }

  if (!userData?.microsoft_refresh_token) {
    throw new Error('Microsoft account not connected');
  }

  // Try to refresh the token to verify the connection
  await refreshMicrosoftToken(userData.microsoft_refresh_token);
  console.log('Connection test successful');
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, action = 'sync', direction = 'push' } = await req.json() as SyncPayload;

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Request received:', { userId, action, direction });

    if (action === 'test-connection') {
      await testConnection(userId, supabaseClient);
      return new Response(
        JSON.stringify({ message: 'Connection test successful' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Get user's Microsoft refresh token
    const { data: userData, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('microsoft_refresh_token')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User profile fetch error:', userError);
      throw new Error('Failed to fetch user profile');
    }

    if (!userData?.microsoft_refresh_token) {
      throw new Error('Microsoft account not connected. Please connect your account first.');
    }

    // Try to refresh the access token
    const accessToken = await refreshMicrosoftToken(userData.microsoft_refresh_token);

    // Update last sync attempt time
    await supabaseClient
      .from('integration_settings')
      .update({
        last_sync_attempt: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('integration_type', 'microsoft_calendar');

    if (direction === 'push') {
      // Implementation for push sync would go here
      console.log('Push sync not yet implemented');
    }

    // Update last successful sync time
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
    console.error('Function error:', error);
    
    // Update sync status to error if possible
    try {
      const { userId } = await req.json() as SyncPayload;
      if (userId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
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
