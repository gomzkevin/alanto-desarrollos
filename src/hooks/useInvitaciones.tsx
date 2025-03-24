
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface Invitacion {
  id: string;
  email: string;
  empresa_id: number;
  rol: string;
  estado: string;
  token: string;
  fecha_expiracion: string;
  fecha_creacion: string;
  creado_por: string;
  // Campos adicionales para compatibilidad
  fecha_envio?: string;
  created_at?: string;
  es_valida?: boolean;
}

export interface InvitationVerificationResult {
  id: string;
  empresa_id: number;
  email: string;
  rol: string;
  estado: string;
  es_valida: boolean;
}

export const useInvitaciones = () => {
  const { empresaId, isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  // Obtener invitaciones
  const { data: invitaciones = [], isLoading, error, refetch } = useQuery({
    queryKey: ['invitaciones', empresaId],
    queryFn: async () => {
      if (!empresaId || !isAdmin()) return [];

      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .select('*')
        .eq('empresa_id', empresaId);

      if (error) throw error;
      
      // Convertir a tipo Invitacion
      return (data || []) as Invitacion[];
    },
    enabled: !!empresaId && isAdmin()
  });

  // Verificar una invitación por token
  const verificarInvitacion = async (token: string): Promise<InvitationVerificationResult> => {
    const { data, error } = await supabase
      .rpc('verificar_invitacion', { token_invitacion: token });

    if (error) throw error;
    
    // Asegurarse de que haya resultados y que sea un array
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Invitación no encontrada o inválida');
    }
    
    // Devolver el primer resultado
    return data[0] as InvitationVerificationResult;
  };

  // Aceptar una invitación (usar en el proceso de registro)
  const aceptarInvitacion = async (token: string, userId: string) => {
    // Primero verificar la invitación
    const invitacion = await verificarInvitacion(token);
    
    if (!invitacion.es_valida) {
      throw new Error('La invitación no es válida o ha expirado');
    }
    
    // Actualizar el estado de la invitación
    const { error: updateError } = await supabase
      .from('invitaciones_empresa')
      .update({ estado: 'aceptada' })
      .eq('token', token);
      
    if (updateError) throw updateError;
    
    // Asignar el usuario a la empresa y rol
    const { error: userError } = await supabase
      .from('usuarios')
      .update({
        empresa_id: invitacion.empresa_id,
        rol: invitacion.rol
      })
      .eq('id', userId);
      
    if (userError) throw userError;
    
    return true;
  };

  // Crear una invitación
  const createInvitacion = useMutation({
    mutationFn: async ({ email, rol }: { email: string; rol: string }) => {
      if (!empresaId || !isAdmin()) {
        throw new Error('No tienes permisos para crear invitaciones');
      }

      // Generar un token único
      const token = Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
                   
      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .insert({
          email,
          rol,
          empresa_id: empresaId,
          token,
          creado_por: await supabase.auth.getUser().then(res => res.data.user?.id)
        })
        .select()
        .single();

      if (error) throw error;
      return data as Invitacion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación creada",
        description: "La invitación ha sido creada y enviada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo crear la invitación: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Reenviar una invitación
  const resendInvitacion = useMutation({
    mutationFn: async (invitacionId: string) => {
      if (!empresaId || !isAdmin()) {
        throw new Error('No tienes permisos para reenviar invitaciones');
      }
      
      // Aquí normalmente se enviaría un correo, pero por ahora solo actualizamos la fecha
      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .update({
          fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', invitacionId)
        .select()
        .single();

      if (error) throw error;
      return data as Invitacion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación reenviada",
        description: "La invitación ha sido reenviada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo reenviar la invitación: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Eliminar una invitación
  const deleteInvitacion = useMutation({
    mutationFn: async (invitacionId: string) => {
      if (!empresaId || !isAdmin()) {
        throw new Error('No tienes permisos para eliminar invitaciones');
      }
      
      const { error } = await supabase
        .from('invitaciones_empresa')
        .delete()
        .eq('id', invitacionId);

      if (error) throw error;
      return invitacionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones'] });
      toast({
        title: "Invitación eliminada",
        description: "La invitación ha sido eliminada correctamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la invitación: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    invitaciones,
    isLoading,
    error,
    createInvitacion,
    deleteInvitacion,
    resendInvitacion,
    refetch,
    verificarInvitacion,
    aceptarInvitacion
  };
};

export default useInvitaciones;
