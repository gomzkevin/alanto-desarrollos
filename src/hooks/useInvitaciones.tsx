
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface Invitacion {
  id: string;
  email: string;
  empresa_id: number;
  rol: string;
  token: string;
  estado: string;
  fecha_envio: string;
  fecha_expiracion: string;
  created_at: string;
}

export const useInvitaciones = () => {
  const { empresaId, isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const { data: invitaciones, isLoading, error, refetch } = useQuery({
    queryKey: ['invitaciones', empresaId],
    queryFn: async () => {
      try {
        if (!empresaId || !isAdmin()) {
          return [];
        }

        const { data, error } = await supabase
          .from('invitaciones_empresa')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        return data as Invitacion[];
      } catch (error) {
        console.error('Error fetching invitaciones:', error);
        throw error;
      }
    },
    enabled: !!empresaId && isAdmin()
  });

  const createInvitacion = useMutation({
    mutationFn: async ({ email, rol }: { email: string; rol: string }) => {
      try {
        // No se necesita verificar límites de suscripción
        
        const { data, error } = await supabase
          .rpc('enviar_invitacion', {
            p_email: email,
            p_empresa_id: empresaId,
            p_rol: rol
          });

        if (error) {
          throw new Error(error.message);
        }

        return data as Invitacion;
      } catch (error) {
        console.error('Error creating invitacion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación enviada",
        description: "La invitación se ha enviado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo enviar la invitación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteInvitacion = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('invitaciones_empresa')
          .delete()
          .eq('id', id);

        if (error) {
          throw new Error(error.message);
        }

        return id;
      } catch (error) {
        console.error('Error deleting invitacion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación cancelada",
        description: "La invitación se ha cancelado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo cancelar la invitación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resendInvitacion = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data, error } = await supabase
          .rpc('reenviar_invitacion', {
            p_invitacion_id: id
          });

        if (error) {
          throw new Error(error.message);
        }

        return data;
      } catch (error) {
        console.error('Error resending invitacion:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación reenviada",
        description: "La invitación se ha reenviado correctamente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo reenviar la invitación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    invitaciones: invitaciones || [],
    isLoading,
    error,
    createInvitacion,
    deleteInvitacion,
    resendInvitacion,
    refetch
  };
};

export default useInvitaciones;
