
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
  const [retryCount, setRetryCount] = useState(0);
  const [empresaChecks, setEmpresaChecks] = useState(0);

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
          
          // Ensure empresa_id is set
          if (userData.empresa_id) {
            setEmpresaId(userData.empresa_id);
            console.log('Empresa ID set:', userData.empresa_id);
          } else {
            // Si el usuario no tiene empresa_id pero debería tenerlo (no es superadmin)
            console.log('No empresa_id found for user, checking further');
            
            // Intentamos hacer una búsqueda directa para asegurar que no sea un problema de timing
            const { data: directData, error: directError } = await supabase
              .from('usuarios')
              .select('empresa_id')
              .eq('auth_id', user.id)
              .single();
              
            if (!directError && directData && directData.empresa_id) {
              console.log('Found empresa_id from direct check:', directData.empresa_id);
              setEmpresaId(directData.empresa_id);
            } else if (retryCount < 3) {
              // Intentar actualizar el usuario con empresa_id=1 para usuarios sin empresa asignada
              console.log('Still no empresa_id, attempting to set default empresa_id=1');
              
              const { error: updateError } = await supabase
                .from('usuarios')
                .update({ empresa_id: 1 })
                .eq('id', userData.id);
                
              if (updateError) {
                console.error('Failed to update empresa_id:', updateError);
              } else {
                console.log('Updated user with empresa_id: 1');
                setEmpresaId(1);
                setRetryCount(prev => prev + 1);
              }
            } else {
              console.error('Failed to find or set empresa_id after multiple attempts');
            }
          }
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
          
          // Ensure empresa_id is set
          if (data.empresa_id) {
            setEmpresaId(data.empresa_id);
            console.log('Empresa ID after auth change:', data.empresa_id);
          } else {
            console.log('No empresa_id found after auth change, attempting to check directly');
            
            // Try to get and update empresa_id from the database
            const { data: directData, error: directError } = await supabase
              .from('usuarios')
              .select('empresa_id')
              .eq('auth_id', session.user.id)
              .single();
              
            if (!directError && directData && directData.empresa_id) {
              console.log('Found empresa_id from direct check:', directData.empresa_id);
              setEmpresaId(directData.empresa_id);
            } else {
              console.error('Still no empresa_id found after direct check');
            }
          }
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
  }, [retryCount]);

  // Efecto adicional para verificar la empresa_id periódicamente si no se ha cargado
  useEffect(() => {
    // Si ya tenemos empresaId o se han hecho demasiados intentos, salir
    if (empresaId || empresaChecks >= 5 || !userId) return;

    const checkEmpresaId = async () => {
      try {
        console.log(`Verificación adicional de empresa_id (intento ${empresaChecks + 1})`);
        const { data, error } = await supabase
          .from('usuarios')
          .select('empresa_id')
          .eq('auth_id', userId)
          .single();
          
        if (!error && data && data.empresa_id) {
          console.log('Found empresa_id in additional check:', data.empresa_id);
          setEmpresaId(data.empresa_id);
        } else {
          console.log('Additional check did not find empresa_id');
          setEmpresaChecks(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error in additional empresa_id check:', error);
        setEmpresaChecks(prev => prev + 1);
      }
    };

    // Esperar 1 segundo antes de verificar para dar tiempo a otras operaciones
    const timeoutId = setTimeout(checkEmpresaId, 1000);
    return () => clearTimeout(timeoutId);
  }, [userId, empresaId, empresaChecks]);

  // Helper methods - Implementación consistente de verificaciones de rol
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
