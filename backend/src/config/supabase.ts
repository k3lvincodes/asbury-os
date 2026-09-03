import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, key: string) {
  return createClient(url, key);
}

// Service role client (backend only — bypasses RLS)
export function createSupabaseServiceClient(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey);
}

// Auth client for admin verification
export function createSupabaseAuthClient(url: string, anonKey: string) {
  return createClient(url, anonKey);
}
