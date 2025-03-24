
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUserRole, UserRole } from './useUserRole';
import { useResourceCounts } from './useResourceCounts';

export interface OrganizationUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
  fecha_creacion: string;
  auth_id?: string;
  empresa_id?: number;
  empresa_anterior?: number;
  fecha_transferencia?: string;
}

export interface OrganizationCompany {
  id: number;
  nombre: string;
}

export function useOrganizationUsers() {
  const { empresaId, isAdmin } = useUserRole();
  const { canAddResource } = useResourceCounts();
  const queryClient = useQueryClient();

  // Obtener usuarios de la organización actual
  const {
    data: users,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['organizationUsers', empresaId],
    queryFn: async (): Promise<OrganizationUser[]> => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al cargar usuarios:', error);
        throw error;
      }

      return data.map(user => ({
        ...user,
        rol: user.rol as UserRole
      })) || [];
    },
    enabled: !!empresaId && !!isAdmin(),
  });

  // Activar/desactivar usuario
  const toggleUserStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string, currentStatus: boolean }) => {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      return { id, newStatus: !currentStatus };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers', empresaId] });
      toast({
        title: "Usuario actualizado",
        description: `El usuario ha sido ${result.newStatus ? "activado" : "desactivado"} correctamente`,
      });
    },
    onError: (error) => {
      console.error('Error al actualizar usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      });
    }
  });

  // Actualizar rol de usuario
  const updateUserRole = useMutation({
    mutationFn: async ({ id, newRole }: { id: string, newRole: UserRole }) => {
      // Verificar si puede añadir un vendedor más (solo si cambio a rol vendedor)
      if (newRole === 'vendedor') {
        const canAdd = await canAddResource('vendedor');
        if (!canAdd) {
          toast({
            title: "Límite alcanzado",
            description: "Has alcanzado el límite de vendedores de tu plan",
            variant: "destructive",
          });
          throw new Error('Límite de vendedores alcanzado');
        }
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ rol: newRole })
        .eq('id', id);

      if (error) throw error;
      return { id, role: newRole };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers', empresaId] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error('Error al actualizar rol:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      });
    }
  });

  // Obtener empresas disponibles para transferencia
  const {
    data: companies,
    isLoading: isLoadingCompanies
  } = useQuery({
    queryKey: ['organizationCompanies'],
    queryFn: async (): Promise<OrganizationCompany[]> => {
      // Solo superadmins pueden ver todas las empresas
      const { data, error } = await supabase
        .from('empresa_info')
        .select('id, nombre')
        .order('nombre');

      if (error) {
        console.error('Error al cargar empresas:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!empresaId,
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    toggleUserStatus,
    updateUserRole,
    companies,
    isLoadingCompanies
  };
}

export default useOrganizationUsers;
