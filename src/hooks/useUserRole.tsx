
import { useEffect, useState, useRef } from 'react';
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
  const lastAuthCheckRef = useRef(0);
  const pendingUserDataRef = useRef<UserData | null>(null);
  const authChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limitar la frecuencia de verificaciones de autenticación
    const now = Date.now();
    if (isProcessingAuth || (now - lastAuthCheckRef.current < 3000 && lastAuthCheckRef.current !== 0)) return;

    const fetchUserData = async () => {
      try {
        setIsProcessingAuth(true);
        lastAuthCheckRef.current = Date.now();
        setIsLoading(true);
        
        // Get the current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Error fetching auth user:', authError);
          setAuthChecked(true);
          setIsLoading(false);
          setTimeout(() => setIsProcessingAuth(false), 2000);
          return;
        }
        
        if (!user) {
          console.log('No authenticated user found');
          setAuthChecked(true);
          setIsLoading(false);
          setTimeout(() => setIsProcessingAuth(false), 2000);
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
          setTimeout(() => setIsProcessingAuth(false), 2000);
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
        // Añadir un retraso más largo antes de permitir otra verificación
        setTimeout(() => setIsProcessingAuth(false), 3000);
      }
    };
    
    fetchUserData();
    
    // Configurar listener de cambio de estado de autenticación con debounce
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Limpiar cualquier timeout pendiente
      if (authChangeTimeoutRef.current) {
        clearTimeout(authChangeTimeoutRef.current);
      }
      
      // Debounce para cambios de estado de autenticación con rate limiting
      authChangeTimeoutRef.current = setTimeout(async () => {
        // Solo procesar si no estamos ya procesando
        if (!isProcessingAuth) {
          setIsProcessingAuth(true);
          lastAuthCheckRef.current = Date.now();
          
          if (event === 'SIGNED_IN' && session?.user) {
            // Usuario inició sesión, obtener sus datos
            setUserId(session.user.id);
            setUserEmail(session.user.email);
            
            // Store this data before fetching from database to avoid races
            pendingUserDataRef.current = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'cliente' // default
            };
            
            const { data, error } = await supabase
              .from('usuarios')
              .select('*')
              .eq('auth_id', session.user.id)
              .maybeSingle();
            
            if (!error && data) {
              console.log('User data from auth change:', data);
              
              // Clear pending data
              pendingUserDataRef.current = null;
              
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
            pendingUserDataRef.current = null;
            setUserId(null);
            setUserEmail(null);
            setUserRole(null);
            setUserName(null);
            setEmpresaId(null);
          }
          
          setAuthChecked(true);
          
          // Liberar el bloqueo de procesamiento después de un retraso más largo
          setTimeout(() => setIsProcessingAuth(false), 3000);
        }
      }, 1000); // Debounce por 1000ms para más estabilidad
    });
    
    return () => {
      if (authChangeTimeoutRef.current) {
        clearTimeout(authChangeTimeoutRef.current);
      }
      authListener.subscription.unsubscribe();
    };
  }, [isProcessingAuth]);

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
