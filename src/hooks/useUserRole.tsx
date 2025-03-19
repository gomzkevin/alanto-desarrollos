
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'vendedor' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setRole(null);
          setIsLoading(false);
          return;
        }
        
        setUserId(session.user.id);
        
        // Fetch user role from usuarios table
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('auth_id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          setRole(data?.rol as UserRole || null);
        }
      } catch (error) {
        console.error('Error in useUserRole hook:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
    
    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id);
        fetchUserRole();
      } else {
        setUserId(null);
        setRole(null);
        setIsLoading(false);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Helper functions to check permissions
  const isAdmin = () => role === 'admin';
  const isVendedor = () => role === 'vendedor';
  const canCreateResource = (resourceType: 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion') => {
    if (resourceType === 'desarrollo' || resourceType === 'prototipo' || resourceType === 'propiedad') {
      return isAdmin();
    }
    return isAdmin() || isVendedor();
  };
  
  return {
    role,
    isLoading,
    userId,
    isAdmin,
    isVendedor,
    canCreateResource
  };
};

export default useUserRole;
