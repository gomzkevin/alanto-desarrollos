import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';

interface UserData {
  id: string;
  rol: string;
  nombre: string;
  email: string;
  empresaId: number | null;
}

interface Permissions {
  canCreateResource: boolean;
  canEditResource: boolean;
  canDeleteResource: boolean;
  canSeeFinancials: boolean;
  isAdmin: boolean;
}

export const useUserRole = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    canCreateResource: false,
    canEditResource: false,
    canDeleteResource: false,
    canSeeFinancials: false,
    isAdmin: false,
  });

  const user = useUser();

  useEffect(() => {
    const fetchRole = async () => {
      if (user?.id) {
        const fetchedUserData = await fetchUserData(user.id);
        setUserData(fetchedUserData);
      } else {
        setUserData(null);
        setPermissions({
          canCreateResource: false,
          canEditResource: false,
          canDeleteResource: false,
          canSeeFinancials: false,
          isAdmin: false,
        });
      }
    };

    fetchRole();
  }, [user]);

  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      // First get the user info from usuarios table
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return null;
      }

      // Make sure all userData properties are safely accessed with null checks
      const empresaId = data?.empresa_id || null;
      const rolValue = data?.rol || 'vendedor';
      
      // Create user data object with safe null checks
      const userData: UserData = {
        id: data?.id || '',
        rol: data?.rol || 'vendedor',
        nombre: data?.nombre || '',
        email: data?.email || '',
        empresaId: empresaId,
      };

      // Set permissions based on role
      const updatedPermissions: Permissions = {
        canCreateResource: ['admin', 'gerente'].includes(rolValue),
        canEditResource: ['admin', 'gerente', 'vendedor'].includes(rolValue),
        canDeleteResource: ['admin'].includes(rolValue),
        canSeeFinancials: ['admin', 'gerente'].includes(rolValue),
        isAdmin: rolValue === 'admin',
      };

      setPermissions(updatedPermissions);
      
      return userData;
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      return null;
    }
  };

  return {
    userData,
    permissions,
    canCreateResource: permissions.canCreateResource,
    canEditResource: permissions.canEditResource,
    canDeleteResource: permissions.canDeleteResource,
    canSeeFinancials: permissions.canSeeFinancials,
    isAdmin: permissions.isAdmin,
  };
};

export default useUserRole;
