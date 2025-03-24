
import { useEffect, useState } from "react";
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

  useEffect(() => {
    // Only run the auth check if we're not already processing it
    if (isProcessingAuth) return;

    const checkAuth = async () => {
      try {
        setIsProcessingAuth(true);
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
        }, 1000);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setUserId(session?.user?.id || null);
        setUserEmail(session?.user?.email || null);
      }
    );
    
    return () => {
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

// This fixes the "no exported member 'default'" error
export default useAuth;
