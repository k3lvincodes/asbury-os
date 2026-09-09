import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://juorbzueukqhufnojagu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1b3JienVldWtxaHVmbm9qYWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NzY4OTgsImV4cCI6MjEwNDI1Mjg5OH0.IW8dFxNEUqZEqePydAkgsfrlAOxea9CvP_0cDSnGmUw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
