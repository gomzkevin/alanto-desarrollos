
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VentaWithDetail } from './types';

/**
 * Hook para actualizar automáticamente el estado de una venta
 * cuando se alcanza el 100% del pago
 */
export const useAutoUpdateVentaStatus = (
  ventaId?: string,
  venta?: VentaWithDetail | null, 
  progreso?: number,
  refetch?: () => Promise<void>
) => {
  const { toast } = useToast();

  useEffect(() => {
    const updateVentaStatus = async () => {
      if (!venta || !ventaId || !refetch) return;
      
      // Check if we've reached 100% payment but status is still "en_proceso"
      if (progreso && progreso >= 100 && venta.estado === 'en_proceso') {
        try {
          // Update venta status to "completada"
          const { error } = await supabase
            .from('ventas')
            .update({ 
              estado: 'completada',
              fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', ventaId);
            
          if (error) {
            console.error('Error al actualizar estado de venta:', error);
            return;
          }
          
          // Also update the unidad status to "vendido"
          if (venta.unidad?.id) {
            const { error: unidadError } = await supabase
              .from('unidades')
              .update({ estado: 'vendido' })
              .eq('id', venta.unidad.id);
              
            if (unidadError) {
              console.error('Error al actualizar estado de unidad:', unidadError);
            }
          }
          
          // Refresh data
          await refetch();
          
          toast({
            title: "¡Venta completada!",
            description: "La venta ha sido marcada como completada porque se ha alcanzado el 100% del pago.",
          });
        } catch (err) {
          console.error('Error en actualización automática de estado:', err);
        }
      }
    };
    
    updateVentaStatus();
  }, [progreso, venta, ventaId, toast, refetch]);
};

export default useAutoUpdateVentaStatus;
