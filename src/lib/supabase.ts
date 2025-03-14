
import { createClient } from '@supabase/supabase-js';

// Estas URLs deben ser reemplazadas con las URLs reales de tu proyecto Supabase
// Si estás usando variables de entorno, usa: import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ejemplo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'ejemplo-key-supabase';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función auxiliar para comprobar si el usuario está autenticado
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Función para obtener el usuario actual
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};
