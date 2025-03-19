
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'vendedor' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>('admin'); // Set default to admin for development
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // For development, use admin role even if not authenticated
          console.log('No session, using default admin role for development');
          setUserId('dev-user-id');
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
          console.log('Using default admin role for development');
        } else {
          setRole(data?.rol as UserRole || 'admin'); // Default to admin if role not found
        }
      } catch (error) {
        console.error('Error in useUserRole hook:', error);
        console.log('Using default admin role for development');
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
        // For development, use admin role even if not authenticated
        console.log('Auth state changed to no session, using default admin role');
        setUserId('dev-user-id');
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
