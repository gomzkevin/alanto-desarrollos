
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VentaWithDetail } from './types';

export const useVentaDetailMutations = () => {
  const queryClient = useQueryClient();

  const updateVentaStatus = useMutation({
    mutationFn: async (params: { ventaId: string, newStatus: string }) => {
      const { ventaId, newStatus } = params;
      if (!ventaId) throw new Error('ID de venta no proporcionado');
      if (!newStatus) throw new Error('Estado de venta no proporcionado');

      const { data, error } = await supabase
        .from('ventas')
        .update({
          estado: newStatus,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', ventaId)
        .select('*');

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['venta'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      
      // Also update unidad status if venta is completed
      if (data[0]?.estado === 'completada') {
        updateUnidadStatus(data[0].unidad_id, 'vendido');
      }
      
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la venta ha sido actualizado exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error updating venta status:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el estado de la venta',
        variant: 'destructive',
      });
    },
  });

  const updateUnidadStatus = async (unidadId: string, newStatus: string) => {
    try {
      await supabase
        .from('unidades')
        .update({ estado: newStatus })
        .eq('id', unidadId);
    } catch (error) {
      console.error('Error updating unidad status:', error);
    }
  };

  return {
    updateVentaStatus: (ventaId: string, newStatus: string) => 
      updateVentaStatus.mutate({ ventaId, newStatus })
  };
};

export default useVentaDetailMutations;
