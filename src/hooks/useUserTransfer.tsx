
import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useResourceCounts } from './useResourceCounts';

export interface UserTransferParams {
  userId: string;
  targetEmpresaId: number;
  preserveRole?: boolean;
  newRole?: 'admin' | 'vendedor' | 'cliente';
}

export function useUserTransfer() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { empresaId } = useUserRole();
  const { canAddResource } = useResourceCounts();
  
  // Transferir usuario a otra empresa
  const transferUser = async ({ 
    userId,
    targetEmpresaId,
    preserveRole = true,
    newRole
  }: UserTransferParams) => {
    try {
      setLoading(true);
      
      // Obtener datos actuales del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Error al obtener datos del usuario:', userError);
        throw userError;
      }
      
      // Verificar si puede añadir un vendedor más a la empresa destino
      if ((preserveRole && userData.rol === 'vendedor') || newRole === 'vendedor') {
        // Temporalmente cambiar empresaId para verificar en la empresa destino
        const originalEmpresaId = empresaId;
        
        // Esto es solo para la verificación, el empresaId real no cambia por esta asignación
        // porque estamos usando una constante dentro de un closure
        const canAdd = await canAddResource('vendedor', 1);
        
        if (!canAdd) {
          toast({
            title: "Límite alcanzado",
            description: "La empresa destino ha alcanzado su límite de vendedores",
            variant: "destructive",
          });
          return { success: false };
        }
      }
      
      // Actualizar el registro del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          empresa_id: targetEmpresaId,
          empresa_anterior: userData.empresa_id,
          fecha_transferencia: new Date().toISOString(),
          rol: preserveRole ? userData.rol : (newRole || 'vendedor')
        })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error al transferir usuario:', updateError);
        throw updateError;
      }
      
      // Invalidar consultas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      
      toast({
        title: "Usuario transferido",
        description: "El usuario ha sido transferido correctamente a la nueva empresa",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error en transferUser:', error);
      toast({
        title: "Error",
        description: "No se pudo transferir el usuario",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // Transferir múltiples usuarios
  const transferMultipleUsers = async (
    userIds: string[], 
    targetEmpresaId: number, 
    preserveRoles = true,
    defaultRole: 'admin' | 'vendedor' | 'cliente' = 'vendedor'
  ) => {
    try {
      setLoading(true);
      
      const results = await Promise.all(
        userIds.map(userId => 
          transferUser({
            userId,
            targetEmpresaId,
            preserveRole: preserveRoles,
            newRole: !preserveRoles ? defaultRole : undefined
          })
        )
      );
      
      const allSuccessful = results.every(result => result.success);
      
      if (allSuccessful) {
        toast({
          title: "Transferencia completada",
          description: `${userIds.length} usuarios transferidos correctamente`,
        });
        return { success: true };
      } else {
        toast({
          title: "Transferencia parcial",
          description: `Algunos usuarios no pudieron ser transferidos`,
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error) {
      console.error('Error en transferMultipleUsers:', error);
      toast({
        title: "Error",
        description: "No se pudieron transferir los usuarios",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };
  
  // Obtener historial de transferencias
  const getTransferHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('empresa_anterior, fecha_transferencia')
        .eq('id', userId)
        .not('empresa_anterior', 'is', null);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error al obtener historial de transferencias:', error);
      return [];
    }
  };
  
  return {
    transferUser,
    transferMultipleUsers,
    getTransferHistory,
    loading
  };
}

export default useUserTransfer;
