
import { createClient } from '@supabase/supabase-js';

// Estas URLs deberán ser reemplazadas con las URLs reales de tu proyecto Supabase
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
