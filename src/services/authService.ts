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
 * Enhanced secure sign in with email and password - with advanced rate limiting and security logging
 */
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    // Input validation
    if (!email || !password) {
      return { 
        success: false, 
        error: "Email y contraseña son requeridos" 
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { 
        success: false, 
        error: "Formato de email inválido" 
      };
    }

    // Basic password validation (8 characters minimum)
    if (password.length < 8) {
      return { 
        success: false, 
        error: "La contraseña debe tener al menos 8 caracteres" 
      };
    }

    // Advanced rate limiting check using database
    try {
      const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_identifier: email,
        p_action_type: 'login',
        p_max_attempts: 5,
        p_window_minutes: 15,
        p_block_minutes: 30
      });

      if (rateLimitError) {
        console.warn('Rate limit check failed, falling back to local rate limiting:', rateLimitError);
        // Fallback to local rate limiting
        const now = Date.now();
        const lastAttempt = localStorage.getItem(`last_login_attempt_${email}`);
        if (lastAttempt && (now - parseInt(lastAttempt)) < 2000) { // 2 second rate limit
          return {
            success: false,
            error: "Demasiados intentos. Por favor, espere un momento."
          };
        }
        localStorage.setItem(`last_login_attempt_${email}`, now.toString());
      } else if ((rateLimitData as any)?.is_blocked) {
        // Log security event for blocked login attempt
        try {
          await supabase.rpc('log_security_event', {
            p_event_type: 'blocked_login_attempt',
            p_email: email,
            p_details: { attempts_left: (rateLimitData as any).attempts_left },
            p_severity: 'high'
          });
        } catch (error) {
          console.warn('Failed to log security event:', error);
        }

        return {
          success: false,
          error: `Cuenta temporalmente bloqueada debido a múltiples intentos fallidos. Intente nuevamente más tarde.`
        };
      }
    } catch (error) {
      console.warn('Rate limiting failed, continuing with login attempt:', error);
    }
    
    // Attempt secure sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Error de inicio de sesión:", error.message);
      
      // Log failed login attempt
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'failed_login',
          p_email: email,
          p_details: { error_message: error.message },
          p_severity: 'medium'
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      // Provide user-friendly error messages without revealing system details
      if (error.message.includes("Email not confirmed")) {
        return { 
          success: false, 
          error: "Por favor, verifica tu dirección de correo electrónico antes de iniciar sesión" 
        };
      }
      
      if (error.message.includes("Invalid login credentials")) {
        return { 
          success: false, 
          error: "Email o contraseña incorrectos" 
        };
      }
      
      if (error.message.includes("Too many requests")) {
        return { 
          success: false, 
          error: "Demasiados intentos de inicio de sesión. Por favor, intente más tarde." 
        };
      }
      
      return { success: false, error: "Error de inicio de sesión. Por favor, intente nuevamente." };
    }
    
    // Successful sign in
    if (data.user && data.session) {
      console.log("Inicio de sesión exitoso para:", email);
      
      // Log successful login
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'successful_login',
          p_user_id: data.user.id,
          p_email: email,
          p_severity: 'low'
        });
      } catch (logError) {
        console.warn('Failed to log security event:', logError);
      }
      
      // Ensure user exists in the database with proper validation
      await ensureUserInDatabase(data.user.id, data.user.email || email);
      
      // Clear rate limiting data on successful login
      localStorage.removeItem(`last_login_attempt_${email}`);
      
      return { success: true, user: data.user, session: data.session };
    }
    
    return { success: false, error: "No se pudo completar el inicio de sesión" };
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    return { 
      success: false, 
      error: "Ocurrió un error inesperado. Por favor, intente nuevamente." 
    };
  }
};

/**
 * Enhanced signs up with email and password - with password complexity validation
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
    
    // Enhanced password validation using database function
    try {
      const { data: passwordValidation, error: validationError } = await supabase.rpc('validate_password_complexity', {
        password: password
      });

      if (validationError) {
        console.warn('Password validation failed, using client-side validation:', validationError);
        // Fallback to client-side validation
        if (password.length < 12) {
          return { success: false, error: "La contraseña debe tener al menos 12 caracteres" };
        }
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);
        
        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
          return {
            success: false,
            error: "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial"
          };
        }
      } else if (!(passwordValidation as any)?.valid) {
        const errors = (passwordValidation as any)?.errors || [];
        return {
          success: false,
          error: errors.length > 0 ? errors[0] : "La contraseña no cumple con los requisitos de seguridad"
        };
      }
    } catch (error) {
      console.warn('Password complexity check failed, continuing with signup:', error);
    }

    // Rate limiting for signup attempts
    try {
      const { data: rateLimitData, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_identifier: email,
        p_action_type: 'signup',
        p_max_attempts: 3,
        p_window_minutes: 60,
        p_block_minutes: 120
      });

      if (!rateLimitError && (rateLimitData as any)?.is_blocked) {
        return {
          success: false,
          error: "Demasiados intentos de registro. Por favor, intente más tarde."
        };
      }
    } catch (error) {
      console.warn('Signup rate limiting failed, continuing:', error);
    }
    
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
