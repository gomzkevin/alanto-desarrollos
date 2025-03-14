
// DEPRECATED: This file is deprecated. Please use @/integrations/supabase/client instead.
// Example: import { supabase } from "@/integrations/supabase/client";

import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Legacy supabase client (deprecated)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bftuoerxiyocfputahrx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmdHVvZXJ4aXlvY2ZwdXRhaHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njg5OTcsImV4cCI6MjA1NzU0NDk5N30.Os1fTswoDdSO41H4N7I4n3P1FWSjHVzB1zS5BiOZrHs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función auxiliar para comprobar si el usuario está autenticado
export const isAuthenticated = async () => {
  try {
    const { data } = await supabaseClient.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const { data } = await supabaseClient.auth.getUser();
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
