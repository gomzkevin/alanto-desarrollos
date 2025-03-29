
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { VentaCreate, VentaUpdate } from './types';

export const useVentasMutations = () => {
  const queryClient = useQueryClient();

  // Create venta mutation
  const createVenta = useMutation({
    mutationFn: async (ventaData: VentaCreate) => {
      const { data, error } = await supabase
        .from('ventas')
        .insert(ventaData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast({
        title: 'Venta creada',
        description: 'La venta ha sido registrada exitosamente'
      });
    },
    onError: (error: any) => {
      console.error('Error creating venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la venta',
        variant: 'destructive'
      });
    }
  });

  // Update venta mutation
  const updateVenta = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VentaUpdate }) => {
      const { data: updatedData, error } = await supabase
        .from('ventas')
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return updatedData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta', variables.id] });
      toast({
        title: 'Venta actualizada',
        description: 'La venta ha sido actualizada exitosamente'
      });
    },
    onError: (error: any) => {
      console.error('Error updating venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la venta',
        variant: 'destructive'
      });
    }
  });

  // Delete venta mutation
  const deleteVenta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (_, ventaId) => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['venta', ventaId] });
      toast({
        title: 'Venta eliminada',
        description: 'La venta ha sido eliminada exitosamente'
      });
    },
    onError: (error: any) => {
      console.error('Error deleting venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la venta',
        variant: 'destructive'
      });
    }
  });

  return {
    createVenta,
    updateVenta,
    deleteVenta
  };
};
