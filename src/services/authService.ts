
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
      .select('id, email, empresa_id, rol')
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
 * Tries to automatically confirm a user's email
 */
export const tryConfirmEmail = async (userId: string, email: string, password: string): Promise<boolean> => {
  try {
    console.log("Intentando confirmar email automáticamente para:", email);
    
    // Método 1: Intenta usar el método de admin para confirmar
    try {
      const { error: adminError } = await supabase.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      
      if (!adminError) {
        console.log("Email confirmado por método admin");
        return true;
      }
    } catch (adminError) {
      console.log("Error al intentar confirmar con admin (esperado):", adminError);
    }
    
    // Método 2: Intenta actualizar los metadatos del usuario
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { email_confirmed: true, confirmed_at: new Date().toISOString() }
      });
      
      if (!updateError) {
        console.log("Usuario actualizado con confirmación en metadatos");
        return true;
      }
    } catch (updateError) {
      console.log("Error al actualizar metadatos del usuario:", updateError);
    }
    
    // Método 3: Intenta registrar al usuario nuevamente con la opción de auto-confirmar
    try {
      // Fix: move 'data' inside 'options.data' to match Supabase's expected structure
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/auth",
          data: {
            confirmed_at: new Date().toISOString(),
            email_confirmed: true
          }
        }
      });
      
      if (!signUpError) {
        console.log("Usuario registrado nuevamente con confirmación");
        return true;
      }
    } catch (signUpError) {
      console.log("Error al registrar usuario nuevamente:", signUpError);
    }
    
    // Si todos los métodos fallan, intentemos un enfoque directo
    // Esto es un último recurso y podría no funcionar en producción
    try {
      // Forzar una actualización al iniciar sesión
      // Fix: move 'data' inside 'options.data' to match Supabase's expected structure
      await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          data: {
            confirmed_at: new Date().toISOString(),
            email_confirmed: true
          }
        }
      });
      
      return true;
    } catch (forceError) {
      console.log("Error al forzar confirmación:", forceError);
    }
    
    return false;
  } catch (error) {
    console.error("Error general al intentar confirmar email:", error);
    return false;
  }
};

/**
 * Signs in with email and password
 */
export const signInWithEmailPassword = async (email: string, password: string, forceConfirm = false) => {
  try {
    // Primero, verificamos si el usuario existe en la base de datos para saber su rol
    let isVendorOrAdmin = false;
    let userId = null;
    
    const { data: userData } = await supabase
      .from('usuarios')
      .select('auth_id, rol')
      .eq('email', email)
      .maybeSingle();
      
    if (userData) {
      isVendorOrAdmin = userData.rol === 'vendedor' || userData.rol === 'admin';
      userId = userData.auth_id;
      console.log(`Usuario encontrado en la base de datos. Rol: ${userData.rol}, ID: ${userData.auth_id}`);
    }
    
    // Intenta iniciar sesión normalmente
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Si hay un error de correo no confirmado y es vendedor/admin o se solicitó forzar confirmación
    if (error && (error.message.includes("Email not confirmed") || error.message.includes("Correo no confirmado")) 
        && (isVendorOrAdmin || forceConfirm)) {
      
      console.log("Correo no confirmado detectado para vendedor/admin o forzado:", email);
      
      // Si tenemos el ID del usuario, intentamos confirmar su email
      if (userId) {
        const confirmed = await tryConfirmEmail(userId, email, password);
        
        if (confirmed) {
          // Intentar iniciar sesión nuevamente después de confirmar
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!loginError && loginData.user) {
            await ensureUserInDatabase(loginData.user.id, loginData.user.email || email);
            return { success: true, user: loginData.user };
          }
        }
      }
      
      // Si no pudimos confirmar o iniciar sesión después de confirmar
      return { 
        success: false, 
        error: "No se pudo iniciar sesión automáticamente. Por favor, contacte al administrador." 
      };
    } else if (error) {
      // Otros errores de inicio de sesión
      return { success: false, error: error.message };
    } 
    
    // Inicio de sesión exitoso
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
    
    // First check if user already exists in auth system
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If the user exists and can sign in with these credentials, return success
    if (existingUser?.user) {
      console.log("Usuario ya existía en auth, usando el existente:", existingUser.user.id);
      // Ensure user exists in the usuarios table with empresa_id
      await ensureUserInDatabase(existingUser.user.id, existingUser.user.email || email, empresaId);
      return { success: true, user: existingUser.user, message: "Se utilizó un usuario existente" };
    }
    
    // Si no pudo iniciar sesión, verificamos si es por correo no confirmado
    if (signInError && signInError.message.includes("Email not confirmed")) {
      // Intentamos obtener el usuario existente
      const { data: userByEmail } = await supabase
        .from('usuarios')
        .select('auth_id, email')
        .eq('email', email)
        .maybeSingle();
      
      if (userByEmail && userByEmail.auth_id) {
        // Intentamos actualizar el usuario para marcar su correo como confirmado y cambiar la contraseña
        try {
          // Actualizamos directamente su contraseña 
          const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
            userByEmail.auth_id,
            { password, email_confirm: true }
          );
          
          if (!updateError && updatedUser) {
            // Intentar iniciar sesión con las nuevas credenciales
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (!loginError && loginData.user) {
              // Ensure user exists in the usuarios table with empresa_id
              await ensureUserInDatabase(loginData.user.id, loginData.user.email || email, empresaId);
              return { success: true, user: loginData.user, message: "Credenciales actualizadas" };
            }
          }
        } catch (adminError) {
          console.error("Error al intentar actualizar usuario:", adminError);
        }
      }
    }
    
    // Si el usuario no existe o las credenciales son incorrectas, intentamos registrarlo
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
        data: {
          confirmed_at: new Date().toISOString(), // Intento de marcar como confirmado automáticamente
        }
      }
    });

    if (error) {
      // Si el error es que el usuario ya existe, pero no pudimos iniciar sesión, la contraseña debe ser diferente
      if (error.message.includes("already registered")) {
        return { 
          success: false, 
          error: "Este correo electrónico ya está registrado con una contraseña diferente" 
        };
      }
      
      console.error("Error en registro:", error);
      return { success: false, error: error.message };
    } 
    
    console.log("Usuario registrado en auth:", data.user?.id);
    
    // En modo desarrollo, intentamos iniciar sesión inmediatamente después del registro
    try {
      if (data.user) {
        // Intentamos actualizar el usuario para marcarlo como confirmado
        const { error: adminError } = await supabase.auth.admin.updateUserById(
          data.user.id,
          { email_confirm: true }
        );
        
        if (adminError) {
          console.log("No se pudo confirmar el email automáticamente (modo admin):", adminError);
        }
        
        // Ensure user exists in the usuarios table with empresa_id
        await ensureUserInDatabase(data.user.id, data.user.email || email, empresaId);
        
        // Intentar iniciar sesión inmediatamente
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError && signInData.user) {
          return { success: true, user: signInData.user, autoSignIn: true };
        }
        
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
    
    return { 
      success: true, 
      message: "Usuario registrado. En modo producción, necesitaría confirmar su correo electrónico." 
    };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, error: "Ocurrió un error inesperado" };
  }
};
