
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
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        setUserEmail(user.email);
        
        // Get the user's role from the usuarios table
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', user.id)
          .single();
        
        if (userError) {
          console.error('Error fetching user data:', userError);
          setIsLoading(false);
          return;
        }
        
        if (userData) {
          console.log('User data loaded:', userData);
          setUserRole(userData.rol);
          setUserName(userData.nombre);
          setIsAdmin(userData.is_company_admin || userData.rol === 'admin');
          setEmpresaId(userData.empresa_id);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        toast({
          title: 'Error',
          description: 'No se pudo obtener la información del usuario',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, fetch their data
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
        
        if (!error && data) {
          console.log('User data from auth change:', data);
          setUserRole(data.rol);
          setUserName(data.nombre);
          setIsAdmin(data.is_company_admin || data.rol === 'admin');
          setEmpresaId(data.empresa_id);
        }
      } else if (event === 'SIGNED_OUT') {
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
