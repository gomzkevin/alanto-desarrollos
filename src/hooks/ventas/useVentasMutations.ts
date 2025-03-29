
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Venta } from './types';

export interface VentaCreate {
  unidad_id: string;
  precio_total: number;
  es_fraccional: boolean;
  estado?: string;
  notas?: string;
  fecha_inicio?: string;
}

export interface VentaUpdate {
  id: string;
  estado?: string;
  precio_total?: number;
  es_fraccional?: boolean;
  notas?: string;
}

export const useVentasMutations = () => {
  const queryClient = useQueryClient();

  const createVenta = useMutation({
    mutationFn: async (ventaData: VentaCreate) => {
      const { data, error } = await supabase
        .from('ventas')
        .insert([
          {
            ...ventaData,
            estado: ventaData.estado || 'en_proceso',
            fecha_inicio: ventaData.fecha_inicio || new Date().toISOString(),
          },
        ])
        .select('*');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast({
        title: 'Venta creada',
        description: 'La venta ha sido creada exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error creating venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la venta',
        variant: 'destructive',
      });
    },
  });

  const updateVenta = useMutation({
    mutationFn: async (ventaData: VentaUpdate) => {
      const { id, ...updateData } = ventaData;
      
      const { data, error } = await supabase
        .from('ventas')
        .update({
          ...updateData,
          fecha_actualizacion: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast({
        title: 'Venta actualizada',
        description: 'La venta ha sido actualizada exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error updating venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la venta',
        variant: 'destructive',
      });
    },
  });

  const deleteVenta = useMutation({
    mutationFn: async (ventaId: string) => {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', ventaId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast({
        title: 'Venta eliminada',
        description: 'La venta ha sido eliminada exitosamente',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting venta:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la venta',
        variant: 'destructive',
      });
    },
  });

  return {
    createVenta,
    updateVenta,
    deleteVenta
  };
};
