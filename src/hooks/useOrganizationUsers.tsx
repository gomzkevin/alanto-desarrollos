
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'admin' | 'vendedor';

export interface OrganizationUser {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  empresa_id: number;
  is_company_admin: boolean;
  activo: boolean;
  created_at?: string;
  fecha_creacion?: string;
  auth_id?: string;
  empresa_anterior?: number;
  fecha_transferencia?: string;
}

export const useOrganizationUsers = () => {
  const { empresaId, isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  // Obtener usuarios de la organización
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['organizationUsers', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;
      
      return (data || []) as OrganizationUser[];
    },
    enabled: !!empresaId
  });

  // Actualizar usuario
  const updateUser = useMutation({
    mutationFn: async (userData: Partial<OrganizationUser> & { id: string }) => {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para actualizar usuarios');
      }
      
      const { id, ...updateData } = userData;
      
      const { data, error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as OrganizationUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario actualizado",
        description: "La información del usuario ha sido actualizada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Cambiar estado de activación de un usuario
  const toggleUserStatus = async (userId: string, activo: boolean) => {
    return updateUser.mutateAsync({ id: userId, activo });
  };

  // Cambiar rol de un usuario
  const updateUserRole = async (userId: string, rol: UserRole) => {
    return updateUser.mutateAsync({ id: userId, rol });
  };

  // Eliminar (desactivar) usuario
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para eliminar usuarios');
      }
      
      // No eliminamos realmente, solo desactivamos
      const { data, error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo desactivar el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Reactivar usuario
  const reactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      if (!isAdmin()) {
        throw new Error('No tienes permisos para reactivar usuarios');
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .update({ activo: true })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario reactivado",
        description: "El usuario ha sido reactivado correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo reactivar el usuario: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    users,
    isLoading,
    error,
    updateUser,
    deleteUser,
    reactivateUser,
    refetch,
    canManageUsers: isAdmin(),
    toggleUserStatus,
    updateUserRole
  };
};

export default useOrganizationUsers;
