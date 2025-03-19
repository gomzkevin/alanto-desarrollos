
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica si el usuario está autenticado
 * @returns Promise<boolean> Verdadero si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return false;
  }
}

/**
 * Obtiene el ID del usuario actual
 * @returns Promise<string | null> ID del usuario o null si no está autenticado
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  } catch (error) {
    console.error("Error al obtener ID de usuario:", error);
    return null;
  }
}
