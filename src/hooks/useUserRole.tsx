
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'vendedor' | null;

export interface UserData {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  empresaId: number | null;
  empresaNombre: string | null;
}

export const useUserRole = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session, redirecting to login');
          setUserData(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        
        // First check if the empresa_id column exists in the usuarios table
        const { data: hasEmpresaColumn, error: columnCheckError } = await supabase
          .rpc('has_column', { table_name: 'usuarios', column_name: 'empresa_id' });
        
        if (columnCheckError) {
          console.error('Error checking for empresa_id column:', columnCheckError);
          toast({
            title: 'Error',
            description: 'Error al verificar la estructura de la base de datos',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch user data from usuarios table
        let query = supabase.from('usuarios');
        
        // Add empresa_id to the selection if the column exists
        if (hasEmpresaColumn) {
          query = query.select('id, nombre, email, rol, empresa_id');
        } else {
          query = query.select('id, nombre, email, rol');
        }
        
        const { data, error } = await query.eq('auth_id', session.user.id).single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: 'Error',
            description: 'No se pudo cargar información del usuario',
            variant: 'destructive',
          });
          setUserData(null);
          setIsLoading(false);
          return;
        }
        
        if (!data) {
          console.log('User not found in usuarios table');
          setUserData(null);
          setIsLoading(false);
          return;
        }
        
        // Get empresa info if empresa_id exists
        let empresaId: number | null = null;
        let empresaNombre: string | null = null;
        
        if (hasEmpresaColumn && data.empresa_id) {
          empresaId = data.empresa_id;
          
          // Get empresa name
          const { data: empresa, error: empresaNameError } = await supabase
            .from('empresa_info')
            .select('nombre')
            .eq('id', empresaId)
            .single();
            
          if (!empresaNameError && empresa) {
            empresaNombre = empresa.nombre;
          }
        }
        
        setUserData({
          id: data.id,
          role: data.rol as UserRole,
          name: data.nombre,
          email: data.email,
          empresaId,
          empresaNombre
        });
      } catch (error) {
        console.error('Error in useUserRole hook:', error);
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Also listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setUserData(null);
        setIsAuthenticated(false);
        navigate('/');
      } else if (session) {
        setIsAuthenticated(true);
        fetchUserData();
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);
  
  // Helper functions to check permissions
  const isAdmin = () => userData?.role === 'admin';
  const isVendedor = () => userData?.role === 'vendedor';
  const canCreateResource = (resourceType: 'desarrollo' | 'prototipo' | 'propiedad' | 'lead' | 'cotizacion') => {
    if (resourceType === 'desarrollo' || resourceType === 'prototipo' || resourceType === 'propiedad') {
      return isAdmin();
    }
    return isAdmin() || isVendedor();
  };
  
  return {
    userData,
    isLoading,
    isAuthenticated,
    isAdmin,
    isVendedor,
    canCreateResource
  };
};

export default useUserRole;
