
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UseAuthProps {
  redirectTo?: string;
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

export const useAuth = ({ redirectTo, requiresSubscription, requiredModule, redirectPath }: UseAuthProps = {}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const lastAuthCheckRef = useRef(0);
  const navigate = redirectTo ? useNavigate() : null;
  const redirectAttemptsRef = useRef(0);

  useEffect(() => {
    // Limitar la frecuencia de verificaciones de autenticación
    const now = Date.now();
    if (isProcessingAuth || (now - lastAuthCheckRef.current < 2000 && lastAuthCheckRef.current !== 0)) return;

    const checkAuth = async () => {
      try {
        setIsProcessingAuth(true);
        lastAuthCheckRef.current = Date.now();
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setUserId(null);
          setUserEmail(null);
        } else {
          setUserId(data.session?.user?.id || null);
          setUserEmail(data.session?.user?.email || null);
          
          // Check subscription authorization if required
          if (requiresSubscription && requiredModule && data.session?.user?.id) {
            // Placeholder - implementación real verificaría acceso basado en suscripción
            setIsAuthorized(true);
          } else {
            setIsAuthorized(true);
          }
        }
        
        setAuthChecked(true);
      } catch (err) {
        console.error("Error in useAuth:", err);
      } finally {
        setIsLoading(false);
        // Añadir un pequeño retraso antes de permitir otra verificación
        setTimeout(() => {
          setIsProcessingAuth(false);
        }, 2000);
      }
    };
    
    checkAuth();
    
    // Configurar listener de cambio de estado de autenticación con debounce
    let authChangeTimeout: NodeJS.Timeout;
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        
        // Limpiar cualquier timeout pendiente
        if (authChangeTimeout) {
          clearTimeout(authChangeTimeout);
        }
        
        // Debounce para cambios de estado de autenticación
        authChangeTimeout = setTimeout(async () => {
          if (!isProcessingAuth) {
            setIsProcessingAuth(true);
            lastAuthCheckRef.current = Date.now();
            
            setUserId(session?.user?.id || null);
            setUserEmail(session?.user?.email || null);
            setAuthChecked(true);
            
            // Liberar el bloqueo de procesamiento después de un retraso
            setTimeout(() => setIsProcessingAuth(false), 2000);
          }
        }, 500); // Debounce por 500ms
      }
    );
    
    return () => {
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      authListener.subscription.unsubscribe();
    };
  }, [isProcessingAuth, requiresSubscription, requiredModule]);

  // Manejar la redirección solo cuando esté habilitada y sea necesaria
  useEffect(() => {
    if (
      redirectTo && 
      navigate && 
      authChecked && 
      !isLoading && 
      !userId && 
      redirectAttemptsRef.current < 2
    ) {
      redirectAttemptsRef.current += 1;
      console.log(`Redirecting to ${redirectTo}, attempt: ${redirectAttemptsRef.current}`);
      
      // Usar un timeout para evitar llamadas excesivas a replaceState
      const timer = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 100 * redirectAttemptsRef.current); // Incrementar delay con cada intento
      
      return () => clearTimeout(timer);
    }
  }, [redirectTo, navigate, authChecked, isLoading, userId]);

  // Handle login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error in login:", error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const signup = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error("Error in signup:", error);
      return { user: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Error al cerrar sesión",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setUserId(null);
      setUserEmail(null);
      return { error: null };
    } catch (error) {
      console.error("Error in logout:", error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return { userId, userEmail, isLoading, isAuthorized, authChecked, login, signup, logout };
};

export default useAuth;
