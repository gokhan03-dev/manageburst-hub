
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Task {
  id: string;
  title: string;
  description: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  location?: string;
  attendees?: Array<{
    email: string;
    required: boolean;
  }>;
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

    const { path, task, userId, taskId } = await req.json();

    // Get Microsoft integration settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('integration_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('integration_type', 'microsoft_calendar')
      .single();

    if (settingsError || !settings) {
      throw new Error('Failed to fetch integration settings');
    }

    // Initialize Microsoft Graph client
    const graphClient = await initializeGraphClient(settings.config.auth_code);

    let result;
    switch (path) {
      case '/calendar/import':
        result = await importCalendarItems(graphClient, userId);
        break;
      case '/calendar/create':
        result = await createCalendarItem(graphClient, task);
        break;
      case '/calendar/update':
        result = await updateCalendarItem(graphClient, task);
        break;
      case '/calendar/delete':
        result = await deleteCalendarItem(graphClient, taskId);
        break;
      default:
        throw new Error('Invalid operation');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Calendar sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions for Microsoft Graph operations
async function initializeGraphClient(authCode: string) {
  // Initialize Microsoft Graph client with the auth code
  // This is a placeholder - actual implementation would use Microsoft Graph SDK
  return {};
}

async function importCalendarItems(graphClient: any, userId: string) {
  // Import calendar items logic
  return { message: 'Calendar items imported' };
}

async function createCalendarItem(graphClient: any, task: Task) {
  // Create calendar item logic
  return { message: 'Calendar item created' };
}

async function updateCalendarItem(graphClient: any, task: Task) {
  // Update calendar item logic
  return { message: 'Calendar item updated' };
}

async function deleteCalendarItem(graphClient: any, taskId: string) {
  // Delete calendar item logic
  return { message: 'Calendar item deleted' };
}
