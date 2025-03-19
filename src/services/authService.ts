
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Ensures the authenticated user exists in the usuarios table
 */
export const ensureUserInDatabase = async (userId: string, userEmail: string, empresaId?: number): Promise<boolean> => {
  try {
    console.log('Verificando si el usuario existe en la tabla usuarios:', userId);
    
    // First check if user already exists in the table
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, email, empresa_id')
      .eq('auth_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // User not found
        console.log('Usuario no encontrado en tabla usuarios, creándolo ahora:', userEmail);
        
        // Extract name from email
        const nombre = userEmail.split('@')[0] || 'Usuario';
        
        const { data: insertData, error: insertError } = await supabase
          .from('usuarios')
          .insert({
            auth_id: userId,
            email: userEmail,
            nombre: nombre,
            rol: 'admin', // Default for development
            empresa_id: empresaId || null
          })
          .select();
        
        if (insertError) {
          console.error('Error al crear registro de usuario:', insertError);
          return false;
        }
        
        console.log('Usuario creado exitosamente en tabla usuarios:', insertData);
        return true;
      }
      
      console.error('Error al verificar usuario en la tabla:', error);
      return false;
    }
    
    // If user exists but doesn't have empresa_id and we have one, update it
    if (data && empresaId && !data.empresa_id) {
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ empresa_id: empresaId })
        .eq('auth_id', userId);
        
      if (updateError) {
        console.error('Error al actualizar empresa_id del usuario:', updateError);
      } else {
        console.log('Empresa_id actualizado para el usuario:', userId);
      }
    }
    
    console.log('Usuario ya existe en tabla usuarios:', data);
    return true;
  } catch (error) {
    console.error('Error en ensureUserInDatabase:', error);
    return false;
  }
};

/**
 * Signs in with email and password
 */
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If error is "Email not confirmed", try handling this case
      if (error.message.includes("Email not confirmed")) {
        toast({
          title: "Correo no confirmado",
          description: "Estamos en modo desarrollo, intentando iniciar sesión de todos modos...",
        });
        
        // In development, try to update user to automatically confirm email
        try {
          // First get user by email
          const { data: userData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (!signUpError && userData) {
            // Try to sign in again
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (!loginError && loginData.user) {
              // Ensure user exists in the usuarios table
              await ensureUserInDatabase(loginData.user.id, loginData.user.email || email);
              return { success: true, user: loginData.user };
            }
          }
        } catch (confirmError) {
          console.error("Error al intentar confirmar email:", confirmError);
        }
      }
      
      return { success: false, error: error.message };
    } 
    
    if (data.user) {
      // Ensure user exists in the usuarios table
      await ensureUserInDatabase(data.user.id, data.user.email || email);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: "No se pudo iniciar sesión" };
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    return { success: false, error: "Ocurrió un error inesperado" };
  }
};

/**
 * Signs up with email and password
 */
export const signUpWithEmailPassword = async (email: string, password: string, empresaId?: number) => {
  try {
    console.log("Iniciando registro con email:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
        data: {
          confirmed_at: new Date().toISOString(), // This won't work directly, it's just to illustrate
        }
      }
    });

    if (error) {
      console.error("Error en registro:", error);
      return { success: false, error: error.message };
    } 
    
    console.log("Usuario registrado en auth:", data.user?.id);
    
    // En modo desarrollo, intentar iniciar sesión inmediatamente después del registro
    try {
      if (data.user) {
        // Ensure user exists in the usuarios table with empresa_id
        await ensureUserInDatabase(data.user.id, data.user.email || email, empresaId);
        return { success: true, user: data.user };
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!signInError && signInData.user) {
        // Ensure user exists in the usuarios table with empresa_id
        await ensureUserInDatabase(signInData.user.id, signInData.user.email || email, empresaId);
        return { success: true, user: signInData.user, autoSignIn: true };
      }
    } catch (signInError) {
      console.error("Error al intentar iniciar sesión después del registro:", signInError);
    }
    
    return { success: true, message: "Por favor, revisa tu correo electrónico para confirmar tu cuenta" };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, error: "Ocurrió un error inesperado" };
  }
};
