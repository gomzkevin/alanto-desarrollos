
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
 * Creates a new empresa record and returns its ID
 */
export const createEmpresa = async (nombre: string): Promise<number | null> => {
  try {
    console.log('Creando nueva empresa:', nombre);
    
    // First create a base record in empresa_info
    const { data, error } = await supabase
      .from('empresa_info')
      .insert({
        nombre: nombre,
        email: 'contacto@' + nombre.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
        sitio_web: 'www.' + nombre.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
      })
      .select('id')
      .single();
      
    if (error) {
      console.error('Error al crear empresa:', error);
      return null;
    }
    
    console.log('Empresa creada exitosamente:', data);
    return data.id;
  } catch (error) {
    console.error('Error en createEmpresa:', error);
    return null;
  }
};

/**
 * Signs in with email and password
 */
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    // Intenta iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Manejo de errores
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
  nombreEmpresa?: string
) => {
  try {
    console.log("Iniciando registro con email:", email, "rol:", userRole, "empresa:", nombreEmpresa);
    
    // Create new empresa if requested
    if (nombreEmpresa && !empresaId) {
      empresaId = await createEmpresa(nombreEmpresa);
      console.log("Nueva empresa creada con ID:", empresaId);
    }
    
    // Register the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
      }
    });

    if (error) {
      // Si el error es que el usuario ya existe
      if (error.message.includes("already registered")) {
        return { 
          success: false, 
          error: "Este correo electrónico ya está registrado. Intente iniciar sesión." 
        };
      }
      
      console.error("Error en registro:", error);
      return { success: false, error: error.message };
    } 
    
    console.log("Usuario registrado en auth:", data.user?.id);
    
    // If user was created successfully, try to sign them in immediately
    if (data.user) {
      // Try to sign in right away
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (!signInError && signInData.user) {
        console.log("Inicio de sesión automático exitoso:", signInData.user.id);
        // Ensure user exists in the usuarios table with empresa_id and specified role
        await ensureUserInDatabase(signInData.user.id, signInData.user.email || email, empresaId, userRole);
        return { success: true, user: signInData.user };
      }
      
      // If can't sign in immediately, ensure the user exists in the usuarios table
      await ensureUserInDatabase(data.user.id, data.user.email || email, empresaId, userRole);
      return { success: true, user: data.user };
    }
    
    // If we get here, registration was successful but we couldn't sign in automatically
    return { 
      success: true, 
      message: "Usuario registrado. Por favor intenta iniciar sesión directamente." 
    };
  } catch (error) {
    console.error("Error en registro:", error);
    return { success: false, error: "Ocurrió un error inesperado" };
  }
};
