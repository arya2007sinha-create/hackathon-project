import { createClient } from '@supabase/supabase-js';
import { config } from './env';

const supabaseKey = config.supabaseServiceRoleKey || config.supabaseAnonKey;

export const supabase = createClient(config.supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
