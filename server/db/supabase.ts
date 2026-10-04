import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * ============================================================================
 * SUPABASE DATABASE CONFIGURATION & CLIENT PLACEHOLDER
 * ============================================================================
 * To connect your Supabase database:
 * 1. Create a project at https://supabase.com
 * 2. Run the SQL script located in 'server/db/schema.sql' inside Supabase's SQL Editor.
 * 3. Copy your Project URL and Anon/Service Role Key from Project Settings > API.
 * 4. Add the following to your .env file:
 *      SUPABASE_URL=https://your-project.supabase.co
 *      SUPABASE_ANON_KEY=your-anon-or-service-role-key
 * 
 * If these environment variables are missing, this server gracefully falls back
 * to the robust in-memory / file-synced seed datastore in 'server/db/store.ts'.
 * ============================================================================
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseClient: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.startsWith('https://') && 
    supabaseKey && 
    !supabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-anon-key')
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log(' [SUPABASE] Successfully initialized Supabase client connection to:', supabaseUrl);
    } catch (err) {
      console.error(' [SUPABASE] Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
};
