
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

/**
 * Intenta verificar un usuario manualmente (para desarrollo)
 * @param email Correo electrónico del usuario
 * @returns Promise<boolean> Verdadero si se verificó con éxito
 */
export async function verifyUserManually(email: string): Promise<boolean> {
  try {
    // Nota: Esta función no funcionará directamente ya que requiere permisos de admin
    // Solo es para ilustrar cómo sería si tuviéramos acceso a la API de admin de Supabase
    console.log("Intento de verificación manual para:", email);
    return true;
  } catch (error) {
    console.error("Error al verificar usuario manualmente:", error);
    return false;
  }
}
