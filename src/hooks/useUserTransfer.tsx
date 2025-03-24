
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface TransferUserRequest {
  userId: string;
  targetEmpresaId: number;
  targetEmpresaNombre?: string;
}

export const useUserTransfer = () => {
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const transferUser = useMutation({
    mutationFn: async ({ userId, targetEmpresaId }: TransferUserRequest) => {
      try {
        if (!isAdmin()) {
          throw new Error('No tienes permiso para transferir usuarios');
        }

        // No se necesita verificar límites de suscripción
        
        // Verificar primero si la empresa destino existe
        const { data: empresaDestino, error: empresaError } = await supabase
          .from('empresas')
          .select('id, nombre')
          .eq('id', targetEmpresaId)
          .single();

        if (empresaError || !empresaDestino) {
          throw new Error('La empresa destino no existe');
        }

        // Ahora realizar la transferencia
        const { data, error } = await supabase
          .from('usuarios')
          .update({ 
            empresa_id: targetEmpresaId,
            // Convertir a vendedor al transferir a otra empresa
            rol: 'vendedor' 
          })
          .eq('id', userId)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return {
          ...data,
          targetEmpresaNombre: empresaDestino.nombre
        };
      } catch (error) {
        console.error('Error transferring user:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizationUsers'] });
      toast({
        title: "Usuario transferido",
        description: `El usuario se ha transferido correctamente a ${data.targetEmpresaNombre || 'la nueva empresa'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo transferir el usuario: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    transferUser,
    canTransferUsers: isAdmin()
  };
};

export default useUserTransfer;
