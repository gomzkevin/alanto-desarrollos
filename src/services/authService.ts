import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Ensures the authenticated user exists in the usuarios table
 */
export const ensureUserInDatabase = async (userId: string, userEmail: string, empresaId?: number, userRole?: string): Promise<boolean> => {
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
            rol: userRole || 'admin', // Use provided role or default to admin
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
 * Checks if a user's email is confirmed
 */
export const isEmailConfirmed = async (email: string): Promise<boolean> => {
  try {
    // This was causing the TypeScript error:
    // The Supabase API doesn't accept 'filter' in PageParams for listUsers
    // Let's use a different approach that's compatible with the API
    
    // Try to get user by email using auth API
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error || !users) {
      console.log("No se pudo obtener información de usuarios:", error);
      return false;
    }
    
    // Find user with matching email
    // Fix TypeScript error by properly typing the users array
    const user = users.find((u: { email?: string }) => u.email === email);
    if (!user) {
      console.log("No se encontró usuario con email:", email);
      return false;
    }
    
    return !!(user as any).email_confirmed_at;
  } catch (error) {
    console.log("Error al verificar confirmación de email:", error);
    return false;
  }
};

/**
 * Marked as deprecated - replaced with more direct approach
 * Tries to automatically confirm a user's email - this doesn't work with Supabase's restrictions
 */
export const tryConfirmEmail = async (userId: string, email: string, password: string): Promise<boolean> => {
  console.log("Esta función ya no se utiliza directamente. Se recomienda actualizar al enfoque de autoconfirmación durante el signup.");
  return false;
};

/**
 * Signs in with email and password
 */
export const signInWithEmailPassword = async (email: string, password: string, forceConfirm = false) => {
  try {
    // Primero, verificamos si el usuario existe en la base de datos para saber su rol
    let isVendorOrAdmin = false;
    let userId = null;
    
    // Intenta obtener información del usuario desde la tabla usuarios
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

    // Si hay un error de correo no confirmado
    if (error && (error.message.includes("Email not confirmed") || error.message.includes("Correo no confirmado"))) {
      console.log("Correo no confirmado detectado para usuario:", email);
      
      // Intentar alternativa para iniciar sesión (autoconfirmación en registro)
      console.log("Intentando registro con autoconfirmación para:", email);
      
      // Para vendedores, intentamos un enfoque de registro automático 
      // que aprovecha la opción de confirmación en los metadatos
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
      
      if (!signUpError && signUpData.user) {
        console.log("Registro exitoso con datos de autoconfirmación:", signUpData.user.id);
        
        // Si es un usuario existente, intentar iniciar sesión inmediatamente
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!loginError && loginData.user) {
          await ensureUserInDatabase(loginData.user.id, loginData.user.email || email);
          return { success: true, user: loginData.user };
        }
      }
      
      // Si todo lo anterior falla, regresamos un mensaje amigable
      return { 
        success: false, 
        error: "No se pudo iniciar sesión. Por favor, contacte al administrador para verificar su cuenta." 
      };
    } else if (error) {
      // Otros errores de inicio de sesión
      let friendlyError = error.message;
      
      if (error.message.includes("Invalid login credentials")) {
        friendlyError = "Credenciales incorrectas. Verifique su correo y contraseña.";
      }
      
      return { success: false, error: friendlyError };
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
export const signUpWithEmailPassword = async (
  email: string, 
  password: string, 
  empresaId?: number, 
  userRole?: string,
  autoSignIn: boolean = true // Añadir parámetro para controlar el inicio de sesión automático
) => {
  try {
    console.log("Iniciando registro con email:", email, "rol:", userRole);
    
    // First check if user already exists in auth system
    if (autoSignIn) {
      const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If the user exists and can sign in with these credentials, return success
      if (existingUser?.user) {
        console.log("Usuario ya existía en auth, usando el existente:", existingUser.user.id);
        // Ensure user exists in the usuarios table with empresa_id and specified role
        await ensureUserInDatabase(existingUser.user.id, existingUser.user.email || email, empresaId, userRole);
        return { success: true, user: existingUser.user, message: "Se utilizó un usuario existente" };
      }
    } else {
      // Si autoSignIn es false, solo verificamos si el usuario existe sin iniciar sesión
      const { data: userByEmail } = await supabase
        .from('usuarios')
        .select('auth_id, email')
        .eq('email', email)
        .maybeSingle();

      if (userByEmail && userByEmail.auth_id) {
        console.log("Usuario ya existe, pero no se inicia sesión automáticamente");
      }
    }
    
    // Si el usuario no existe o las credenciales son incorrectas, intentamos registrarlo
    // con autoconfirmación aprovechando los metadatos
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
        data: {
          confirmed_at: new Date().toISOString(), // Intento de marcar como confirmado automáticamente
          user_role: userRole, // Almacenamos el rol en los metadatos de usuario
          email_confirmed: true
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
        // En entornos de desarrollo, podemos intentar iniciar sesión inmediatamente 
        // aprovechando que los metadatos de confirmación ya están establecidos
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!signInError && signInData.user) {
          // Ensure user exists in the usuarios table with empresa_id and specified role
          await ensureUserInDatabase(signInData.user.id, signInData.user.email || email, empresaId, userRole);
          return { success: true, user: signInData.user, autoSignIn: true };
        }
        
        // Si no se puede iniciar sesión inmediatamente, aseguramos que el usuario existe en la tabla
        await ensureUserInDatabase(data.user.id, data.user.email || email, empresaId, userRole);
        return { success: true, user: data.user };
      }
    } catch (signInError) {
      console.error("Error al intentar iniciar sesión después del registro:", signInError);
    }
    
    // Si llegamos aquí, el registro fue exitoso pero posiblemente necesite confirmar email
    return { 
      success: true, 
      message: "Usuario registrado. Verifique su correo electrónico para confirmar su cuenta." 
    };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, error: "Ocurrió un error inesperado" };
  }
};
