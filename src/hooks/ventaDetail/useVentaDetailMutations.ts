
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useVentaDetailMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateVentaStatus = async (ventaId: string, newStatus: string) => {
    try {
      // Update venta status
      const { error: ventaError } = await supabase
        .from('ventas')
        .update({ 
          estado: newStatus,
          fecha_actualizacion: new Date().toISOString() 
        })
        .eq('id', ventaId);
      
      if (ventaError) throw ventaError;
      
      // If marking as completed, also update the unidad status
      if (newStatus === 'completada') {
        // First get the unidad_id from the venta
        const { data: venta, error: fetchError } = await supabase
          .from('ventas')
          .select('unidad_id')
          .eq('id', ventaId)
          .single();
        
        if (fetchError) throw fetchError;
        
        // Then update the unidad status
        const { error: unidadError } = await supabase
          .from('unidades')
          .update({ estado: 'vendida' })
          .eq('id', venta.unidad_id);
        
        if (unidadError) throw unidadError;
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['venta', ventaId] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      
      // Show success toast
      toast({
        title: "Estatus actualizado",
        description: `La venta ha sido marcada como "${newStatus}"`,
        variant: "success",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating venta status:', error);
      
      // Show error toast
      toast({
        title: "Error al actualizar estatus",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const updateVentaMutation = useMutation({
    mutationFn: ({ ventaId, newStatus }: { ventaId: string; newStatus: string }) => 
      updateVentaStatus(ventaId, newStatus),
    onSuccess: () => {
      // Additional success handling if needed
    }
  });

  return {
    updateVentaStatus: (ventaId: string, newStatus: string) => 
      updateVentaMutation.mutate({ ventaId, newStatus })
  };
};

export default useVentaDetailMutations;
