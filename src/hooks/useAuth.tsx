
import { useEffect, useState, useRef } from "react";
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
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();
  const lastAuthCheckRef = useRef(0);

  useEffect(() => {
    // Only run the auth check if we're not already processing it
    // and if at least 2 seconds have passed since the last check
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
            // This is a placeholder - in a real app, you would check if the user
            // has access to the specified module based on their subscription
            setIsAuthorized(true); // For now, always authorize
          } else {
            setIsAuthorized(true); // No subscription check required
          }
        }
      } catch (err) {
        console.error("Error in useAuth:", err);
      } finally {
        setIsLoading(false);
        // Add a small delay before allowing another auth check
        setTimeout(() => {
          setIsProcessingAuth(false);
        }, 2000);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener with debounce
    let authChangeTimeout: NodeJS.Timeout;
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        // Clear any pending timeout
        if (authChangeTimeout) {
          clearTimeout(authChangeTimeout);
        }
        
        // Debounce auth state changes
        authChangeTimeout = setTimeout(async () => {
          if (!isProcessingAuth) {
            setIsProcessingAuth(true);
            lastAuthCheckRef.current = Date.now();
            
            setUserId(session?.user?.id || null);
            setUserEmail(session?.user?.email || null);
            
            // Release the processing lock after a delay
            setTimeout(() => setIsProcessingAuth(false), 2000);
          }
        }, 500); // Debounce for 500ms
      }
    );
    
    return () => {
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      authListener.subscription.unsubscribe();
    };
  }, [isProcessingAuth, requiresSubscription, requiredModule]);

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

  return { userId, userEmail, isLoading, isAuthorized, login, signup, logout };
};

export default useAuth;
