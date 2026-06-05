import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import { supabaseAuthStorage } from './supabaseStorage';

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseAnonKey || 'placeholder',
  {
    auth: {
      storage: supabaseAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
