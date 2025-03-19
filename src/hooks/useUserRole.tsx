
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
          setUserId(null);
          setIsLoading(false);
          return;
        }
        
        const authUserId = session.user.id;
        setUserId(authUserId);
        
        console.log('Current user auth ID:', authUserId);
        console.log('User email:', session.user.email);
        
        // Fetch user role from usuarios table
        const { data, error } = await supabase
          .from('usuarios')
          .select('rol, nombre, email')
          .eq('auth_id', authUserId)
          .single();
        
        if (error) {
          console.error('Error fetching user role:', error);
          
          // If user exists in auth but not in usuarios table, create the record
          if (error.code === 'PGRST116') { // No rows returned error
            try {
              const email = session.user.email;
              const nombre = email?.split('@')[0] || 'Usuario';
              
              console.log('Creating new user record with:', {
                auth_id: authUserId,
                email,
                nombre
              });
              
              // Create a new user record
              const { data: insertData, error: insertError } = await supabase
                .from('usuarios')
                .insert({
                  auth_id: authUserId,
                  email,
                  nombre,
                  rol: 'admin', // Default role for development
                })
                .select();
              
              if (insertError) {
                console.error('Error creating user record:', insertError);
                toast({
                  title: 'Error',
                  description: 'No se pudo crear el registro de usuario en la base de datos.',
                  variant: 'destructive',
                });
                setRole('admin'); // Default para desarrollo
              } else {
                console.log('Created new user record:', insertData);
                toast({
                  title: 'Usuario creado',
                  description: 'Se ha creado tu perfil de usuario.',
                });
                setRole('admin'); // Default para desarrollo
              }
            } catch (insertErr) {
              console.error('Error in user creation process:', insertErr);
              setRole('admin'); // Default para desarrollo
            }
          } else {
            // Default admin if not found (for development)
            setRole('admin');
          }
        } else {
          console.log('User role found:', data?.rol);
          setRole(data?.rol as UserRole || 'admin');
        }
      } catch (error) {
        console.error('Error in useUserRole hook:', error);
        setRole('admin'); // Para desarrollo
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
    
    // También escuchar cambios en el estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
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
