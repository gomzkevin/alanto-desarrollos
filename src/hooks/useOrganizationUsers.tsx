
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface OrganizationUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  avatar_url?: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
}

export const useOrganizationUsers = () => {
  const { empresaId, isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['organizationUsers', empresaId],
    queryFn: async () => {
      try {
        if (!empresaId) {
          return [];
        }

        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        return data as OrganizationUser[];
      } catch (error) {
        console.error('Error fetching organization users:', error);
        throw error;
      }
    },
    enabled: !!empresaId
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<OrganizationUser> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          throw new Error(error.message);
        }
        
        return data as OrganizationUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      try {
        // No se necesita verificar límites de suscripción
        
        const { error } = await supabase
          .from('usuarios')
          .update({ activo: false })
          .eq('id', id);

        if (error) {
          throw new Error(error.message);
        }

        return id;
      } catch (error) {
        console.error('Error deactivating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario desactivado",
        description: "El usuario se ha desactivado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo desactivar el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const reactivateUser = useMutation({
    mutationFn: async (id: string) => {
      try {
        // No se necesita verificar límites de suscripción
        
        const { error } = await supabase
          .from('usuarios')
          .update({ activo: true })
          .eq('id', id);

        if (error) {
          throw new Error(error.message);
        }

        return id;
      } catch (error) {
        console.error('Error reactivating user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario reactivado",
        description: "El usuario se ha reactivado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo reactivar el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    users: users || [],
    isLoading,
    error,
    updateUser,
    deleteUser,
    reactivateUser,
    refetch,
    canManageUsers: isAdmin()
  };
};

export default useOrganizationUsers;
