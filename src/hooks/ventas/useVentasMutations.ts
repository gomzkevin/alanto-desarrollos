
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VentaCreate, VentaUpdate } from './types';

/**
 * Hook para operaciones de mutación relacionadas con ventas
 */
export const useVentasMutations = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  /**
   * Crea una nueva venta
   */
  const createVenta = async (ventaData: VentaCreate) => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert({
          unidad_id: ventaData.unidad_id,
          precio_total: ventaData.precio_total,
          es_fraccional: ventaData.es_fraccional,
          estado: ventaData.estado || 'en_proceso'
        })
        .select();

      if (error) throw error;
      
      // También actualizar el estado de la unidad si es necesario
      const { error: unidadError } = await supabase
        .from('unidades')
        .update({ estado: 'en_proceso' })
        .eq('id', ventaData.unidad_id);
        
      if (unidadError) {
        console.error('Error updating unidad estado:', unidadError);
      }
      
      return data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Actualiza una venta existente
   */
  const updateVenta = async (id: string, updates: VentaUpdate) => {
    setIsUpdating(true);
    try {
      // Asegurarse de que la fecha de actualización se actualice automáticamente
      const updatesWithTimestamp = {
        ...updates,
        fecha_actualizacion: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('ventas')
        .update(updatesWithTimestamp)
        .eq('id', id)
        .select();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    createVenta,
    updateVenta,
    isCreating,
    isUpdating
  };
};

export default useVentasMutations;
