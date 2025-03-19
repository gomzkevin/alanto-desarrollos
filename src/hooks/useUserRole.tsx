
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
  isAdmin?: boolean;
  empresaId?: number;
}

export const useUserRole = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true; // Track component mount state
    
    const fetchUserData = async () => {
      if (!isMounted) return; // Don't proceed if component unmounted
      
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (isMounted) {
          setUserId(user.id);
          setUserEmail(user.email);
        }
        console.log('Auth user found:', user.id, user.email);
        
        // Get the user's role from the usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (userData && isMounted) {
          console.log('User data loaded:', userData);
          setUserRole(userData.rol);
          setUserName(userData.nombre);
          
          // Set isAdmin based on is_company_admin flag or role being 'admin'
          const adminStatus = userData.is_company_admin || userData.rol === 'admin';
          console.log('Admin status:', adminStatus);
          setIsAdmin(adminStatus);
          
          setEmpresaId(userData.empresa_id);
        } else {
          console.log('No user data found in usuarios table');
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'No se pudo obtener la información del usuario',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!isMounted) return; // Don't proceed if component unmounted
      
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, fetch their data
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle(); // Use maybeSingle for safety
        
        if (!error && data && isMounted) {
          console.log('User data from auth change:', data);
          setUserRole(data.rol);
          setUserName(data.nombre);
          
          // Set isAdmin based on is_company_admin flag or role being 'admin'
          const adminStatus = data.is_company_admin || data.rol === 'admin';
          console.log('Admin status after auth change:', adminStatus);
          setIsAdmin(adminStatus);
          
          setEmpresaId(data.empresa_id);
        }
      } else if (event === 'SIGNED_OUT' && isMounted) {
        // User signed out, clear their data
        setUserId(null);
        setUserEmail(null);
        setUserRole(null);
        setUserName(null);
        setIsAdmin(false);
        setEmpresaId(null);
      }
    });
    
    return () => {
      isMounted = false; // Mark component as unmounted
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Helper methods
  const isUserAdmin = () => {
    return isAdmin;
  };

  const canCreateResource = () => {
    return isAdmin || userRole === 'vendedor';
  };

  return {
    userId,
    userEmail,
    userRole,
    userName,
    isAdmin: isUserAdmin,
    canCreateResource,
    empresaId,
    isLoading,
    role: userRole // Alias for compatibility
  };
};

export default useUserRole;
