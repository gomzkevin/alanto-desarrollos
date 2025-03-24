
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'superadmin' | 'admin' | 'vendedor' | 'cliente';

export const useUserRole = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          setAuthChecked(true);
          setIsLoading(false);
          return;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          setAuthChecked(true);
          setIsLoading(false);
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
          return;
        }
        
        if (userData) {
          console.log('User data loaded:', userData);
          
          // Validar que el rol sea uno de los permitidos
          const allowedRoles: UserRole[] = ['superadmin', 'admin', 'vendedor', 'cliente'];
          const roleToUse = allowedRoles.includes(userData.rol as UserRole) 
            ? userData.rol as UserRole 
            : 'cliente';
          
          setUserRole(roleToUse);
          setUserName(userData.nombre);
          setEmpresaId(userData.empresa_id);
          
          console.log('Role set:', roleToUse);
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
      }
    };
    
    fetchUserData();
    
    // Configurar listener de cambio de estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setIsLoading(true);
        
        // Usuario inició sesión, obtener sus datos
        setUserId(session.user.id);
        setUserEmail(session.user.email);
        
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('auth_id', session.user.id)
          .maybeSingle();
        
        if (!error && data) {
          console.log('User data from auth change:', data);
          
          // Validar que el rol sea uno de los permitidos
          const allowedRoles: UserRole[] = ['superadmin', 'admin', 'vendedor', 'cliente'];
          const roleToUse = allowedRoles.includes(data.rol as UserRole) 
            ? data.rol as UserRole 
            : 'cliente';
          
          setUserRole(roleToUse);
          setUserName(data.nombre);
          setEmpresaId(data.empresa_id);
          
          console.log('Role after auth change:', roleToUse);
          console.log('Empresa ID after auth change:', data.empresa_id);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        // User signed out, clear their data
        setUserId(null);
        setUserEmail(null);
        setUserRole(null);
        setUserName(null);
        setEmpresaId(null);
      }
      
      setAuthChecked(true);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Helper methods - Simplified to focus on the role field
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
