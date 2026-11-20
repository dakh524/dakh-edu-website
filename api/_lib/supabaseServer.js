import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseSecret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn('Warning: SUPABASE_URL environment variable is missing.');
}

if (!supabaseSecret) {
  console.warn('Warning: SUPABASE_SECRET_KEY environment variable is missing.');
}

// Administrative server-side Supabase client (strictly server-side, never bundled into client Vite code)
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseSecret || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
