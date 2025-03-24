
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useResourceCounts } from './useResourceCounts';
import { UserRole } from './useUserRole';

export type InvitationRole = 'admin' | 'vendedor' | 'cliente';

export interface Invitacion {
  id: string;
  empresa_id: number;
  email: string;
  rol: InvitationRole;
  token: string;
  creado_por: string | null;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'expirada';
  fecha_creacion: string;
  fecha_expiracion: string;
}

export interface InvitationVerificationResult {
  id: string;
  empresa_id: number;
  email: string;
  rol: string;
  estado: string;
  es_valida: boolean;
}

export function useInvitaciones() {
  const { empresaId } = useUserRole();
  const { canAddResource } = useResourceCounts();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Obtener invitaciones de la empresa actual
  const { 
    data: invitaciones,
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['invitaciones', empresaId],
    queryFn: async (): Promise<Invitacion[]> => {
      if (!empresaId) return [];

      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error al cargar invitaciones:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        rol: item.rol as InvitationRole
      }));
    },
    enabled: !!empresaId,
  });

  // Crear nueva invitación
  const createInvitacion = async (email: string, rol: InvitationRole) => {
    try {
      setLoading(true);

      // Verificar si se puede añadir más vendedores según la suscripción
      if (rol === 'vendedor') {
        const canAdd = await canAddResource('vendedor');
        if (!canAdd) {
          toast({
            title: "Límite alcanzado",
            description: "Has alcanzado el límite de vendedores de tu plan. Actualiza tu suscripción para añadir más.",
            variant: "destructive",
          });
          return { success: false };
        }
      }

      // Verificar si ya existe una invitación activa para este email
      const { data: existingInvite } = await supabase
        .from('invitaciones_empresa')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('email', email)
        .eq('estado', 'pendiente')
        .maybeSingle();

      if (existingInvite) {
        toast({
          title: "Invitación existente",
          description: `Ya existe una invitación pendiente para ${email}`,
          variant: "destructive",
        });
        return { success: false };
      }

      // Verificar si ya existe un usuario con este email en la empresa
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: "Usuario existente",
          description: `El email ${email} ya pertenece a un usuario de tu empresa`,
          variant: "destructive",
        });
        return { success: false };
      }

      // Generar token único
      const token = generateInvitationToken();

      // Crear invitación
      const { data, error } = await supabase
        .from('invitaciones_empresa')
        .insert([{
          empresa_id: empresaId,
          email,
          rol,
          token,
          creado_por: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error al crear invitación:', error);
        throw error;
      }

      toast({
        title: "Invitación enviada",
        description: `Se ha creado una invitación para ${email}`,
      });

      // Actualizar la caché de invitaciones
      queryClient.invalidateQueries({ queryKey: ['invitaciones', empresaId] });
      
      return { success: true, data };
    } catch (error) {
      console.error('Error en createInvitacion:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la invitación",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Cancelar invitación
  const cancelarInvitacion = useMutation({
    mutationFn: async (invitacionId: string) => {
      const { error } = await supabase
        .from('invitaciones_empresa')
        .update({ estado: 'rechazada' })
        .eq('id', invitacionId);

      if (error) throw error;
      return invitacionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones', empresaId] });
      toast({
        title: "Invitación cancelada",
        description: "La invitación ha sido cancelada correctamente"
      });
    },
    onError: (error) => {
      console.error('Error al cancelar invitación:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la invitación",
        variant: "destructive",
      });
    }
  });

  // Verificar validez de un token de invitación
  const verificarInvitacion = async (token: string): Promise<InvitationVerificationResult | null> => {
    try {
      const { data, error } = await supabase
        .rpc('verificar_invitacion', {
          token_invitacion: token
        });

      if (error) {
        console.error('Error al verificar invitación:', error);
        throw error;
      }

      // Ensure data is returned as a single object, not an array
      return data && data.length ? data[0] : null;
    } catch (error) {
      console.error('Error en verificarInvitacion:', error);
      return null;
    }
  };

  // Aceptar invitación
  const aceptarInvitacion = async (token: string, nombre: string, password: string) => {
    try {
      setLoading(true);

      // Verificar si la invitación es válida
      const invitacion = await verificarInvitacion(token);
      
      if (!invitacion || !invitacion.es_valida) {
        toast({
          title: "Invitación inválida",
          description: "La invitación no es válida o ha expirado",
          variant: "destructive",
        });
        return { success: false };
      }

      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitacion.email,
        password,
      });

      if (authError) {
        console.error('Error al crear usuario:', authError);
        throw authError;
      }

      // Si el usuario ya existe en auth, obtener su ID
      let userId = authData.user?.id;
      
      if (!userId) {
        const { data: userData } = await supabase.auth.signInWithPassword({
          email: invitacion.email,
          password,
        });
        userId = userData.user?.id;
      }

      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Crear entrada en la tabla usuarios
      const { error: userError } = await supabase
        .from('usuarios')
        .insert([{
          auth_id: userId,
          nombre,
          email: invitacion.email,
          rol: invitacion.rol,
          empresa_id: invitacion.empresa_id
        }]);

      if (userError) {
        console.error('Error al crear registro de usuario:', userError);
        throw userError;
      }

      // Actualizar estado de la invitación
      const { error: updateError } = await supabase
        .from('invitaciones_empresa')
        .update({ estado: 'aceptada' })
        .eq('id', invitacion.id);

      if (updateError) {
        console.error('Error al actualizar invitación:', updateError);
        throw updateError;
      }

      toast({
        title: "Invitación aceptada",
        description: "Has sido añadido a la empresa correctamente",
      });

      return { success: true };
    } catch (error) {
      console.error('Error en aceptarInvitacion:', error);
      toast({
        title: "Error",
        description: "No se pudo aceptar la invitación",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Función para reenviar invitación (actualiza fecha expiración)
  const reenviarInvitacion = useMutation({
    mutationFn: async (invitacionId: string) => {
      const { error } = await supabase
        .from('invitaciones_empresa')
        .update({ 
          fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'pendiente'
        })
        .eq('id', invitacionId);

      if (error) throw error;
      return invitacionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitaciones', empresaId] });
      toast({
        title: "Invitación reenviada",
        description: "La invitación ha sido reenviada correctamente"
      });
    },
    onError: (error) => {
      console.error('Error al reenviar invitación:', error);
      toast({
        title: "Error",
        description: "No se pudo reenviar la invitación",
        variant: "destructive",
      });
    }
  });

  // Utilidad para generar un token aleatorio para la invitación
  const generateInvitationToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  return {
    invitaciones,
    isLoading,
    error,
    refetch,
    createInvitacion,
    cancelarInvitacion,
    verificarInvitacion,
    aceptarInvitacion,
    reenviarInvitacion,
    loading
  };
}

export default useInvitaciones;
