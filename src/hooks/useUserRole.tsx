
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'superadmin' | 'admin' | 'vendedor' | 'cliente';

interface UserData {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  empresaId?: number;
}

export const useUserRole = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);

  useEffect(() => {
    // Only run the auth check if we're not already processing it
    // and if at least 2 seconds have passed since the last check
    const now = Date.now();
    if (isProcessingAuth || (now - lastAuthCheck < 2000 && lastAuthCheck !== 0)) return;

    const fetchUserData = async () => {
      try {
        setIsProcessingAuth(true);
        setLastAuthCheck(Date.now());
        setIsLoading(true);
        
        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          setAuthChecked(true);
          setIsLoading(false);
          setTimeout(() => setIsProcessingAuth(false), 1000);
          return;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          setAuthChecked(true);
          setIsLoading(false);
          setTimeout(() => setIsProcessingAuth(false), 1000);
          return;
        }
        
        setUserId(user.id);
        setUserEmail(user.email);
        console.log('Auth user found:', user.id, user.email);
        
        // Get the user's role from the usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          setAuthChecked(true);
          setIsLoading(false);
          setTimeout(() => setIsProcessingAuth(false), 1000);
          return;
        }
        
        if (userData) {
          console.log('User data loaded:', userData);
          // Explicit cast string role to UserRole type
          const roleToUse: UserRole = userData.rol as UserRole;
          
          setUserRole(roleToUse);
          setUserName(userData.nombre);
          
          // Establecer empresaId para acceso basado en organización
          setEmpresaId(userData.empresa_id);
          console.log('Empresa ID set:', userData.empresa_id);
        } else {
          console.log('No user data found in usuarios table');
        }
        
        setAuthChecked(true);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        toast({
          title: 'Error',
          description: 'No se pudo obtener la información del usuario',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        // Add a longer delay before allowing another auth check
        setTimeout(() => setIsProcessingAuth(false), 2000);
      }
    };
    
    fetchUserData();
    
    // Set up auth state change listener with debounce
    let authChangeTimeout: NodeJS.Timeout;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Clear any pending timeout
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      
      // Debounce auth state changes
      authChangeTimeout = setTimeout(async () => {
        // Only process if we're not already processing
        if (!isProcessingAuth) {
          setIsProcessingAuth(true);
          setLastAuthCheck(Date.now());
          
          if (event === 'SIGNED_IN' && session?.user) {
            // User signed in, fetch their data
            setUserId(session.user.id);
            setUserEmail(session.user.email);
            
            const { data, error } = await supabase
              .from('usuarios')
              .select('*')
              .eq('auth_id', session.user.id)
              .maybeSingle();
            
            if (!error && data) {
              console.log('User data from auth change:', data);
              // Explicit cast string role to UserRole type
              const roleToUse: UserRole = data.rol as UserRole;
              
              setUserRole(roleToUse);
              setUserName(data.nombre);
              
              // Establecer empresaId para acceso basado en organización
              setEmpresaId(data.empresa_id);
              console.log('Empresa ID after auth change:', data.empresa_id);
            }
          } else if (event === 'SIGNED_OUT') {
            // User signed out, clear their data
            setUserId(null);
            setUserEmail(null);
            setUserRole(null);
            setUserName(null);
            setEmpresaId(null);
          }
          
          // Release the processing lock after a longer delay
          setTimeout(() => setIsProcessingAuth(false), 2000);
        }
      }, 500); // Debounce for 500ms
    });
    
    return () => {
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
      authListener.subscription.unsubscribe();
    };
  }, [isProcessingAuth, lastAuthCheck]);

  // Helper methods
  const isUserAdmin = () => {
    return userRole === 'admin' || userRole === 'superadmin';
  };

  const isSuperAdmin = () => {
    return userRole === 'superadmin';
  };

  const canCreateResource = () => {
    return isUserAdmin() || userRole === 'vendedor';
  };

  return {
    userId,
    userEmail,
    userRole,
    userName,
    isAdmin: isUserAdmin,
    isSuperAdmin,
    canCreateResource,
    empresaId,
    isLoading,
    authChecked,
    role: userRole // Alias para compatibilidad
  };
};

export default useUserRole;
