// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mdcnmchtholpfmnrnsmk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY25tY2h0aG9scGZtbnJuc21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NDAwNzcsImV4cCI6MjA1NTMxNjA3N30.dzfP_zjMHOGPN9eJ0oSNm-T3JiD9KWR03sPpEIarkPo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);