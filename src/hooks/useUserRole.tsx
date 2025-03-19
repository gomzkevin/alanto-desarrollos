
import { useEffect, useState, useCallback } from 'react';
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
  
  // Cache user data fetch to avoid race conditions
  const fetchUserData = useCallback(async (authUserId: string) => {
    console.log('Fetching user data for:', authUserId);
    try {
      // Get the user's role from the usuarios table
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', authUserId)
        .maybeSingle();
      
      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }
      
      if (userData) {
        console.log('User data loaded:', userData);
        
        // Set isAdmin based on is_company_admin flag or role being 'admin'
        const adminStatus = userData.is_company_admin || userData.rol === 'admin';
        console.log('Admin status:', adminStatus);
        
        return {
          role: userData.rol,
          name: userData.nombre,
          isAdmin: adminStatus,
          empresaId: userData.empresa_id
        };
      } else {
        console.log('No user data found in usuarios table');
        return null;
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const initializeUserData = async () => {
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
        
        // Fetch and set user data
        const userData = await fetchUserData(user.id);
        
        if (userData && isMounted) {
          setUserRole(userData.role);
          setUserName(userData.name);
          setIsAdmin(userData.isAdmin);
          setEmpresaId(userData.empresaId);
        }
      } catch (error) {
        console.error('Error in initializeUserData:', error);
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
    
    // Set up auth state change listener first to avoid race conditions
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        // User signed in, set basic info immediately
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        
        // Fetch extended user data
        const userData = await fetchUserData(session.user.id);
        
        if (userData && isMounted) {
          setUserRole(userData.role);
          setUserName(userData.name);
          setIsAdmin(userData.isAdmin);
          setEmpresaId(userData.empresaId);
        }
        if (isMounted) setIsLoading(false);
      } else if (event === 'SIGNED_OUT' && isMounted) {
        // User signed out, clear their data
        setUserId(null);
        setUserEmail(null);
        setUserRole(null);
        setUserName(null);
        setIsAdmin(false);
        setEmpresaId(null);
        setIsLoading(false);
      }
    });
    
    // Initialize user data after setting up the listener
    initializeUserData();
    
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData, toast]);

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
