
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VentaWithDetail } from './types';

/**
 * Hook para manipular el estado de una venta
 */
export const useVentaStatus = (ventaId?: string, venta?: VentaWithDetail | null, onSuccess?: () => Promise<void>) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateVentaStatus = async (newStatus: string): Promise<boolean> => {
    if (!ventaId) return false;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('ventas')
        .update({ 
          estado: newStatus,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', ventaId);
        
      if (error) throw error;
      
      // If marking as completada, also update unidad status
      if (newStatus === 'completada' && venta?.unidad?.id) {
        const { error: unidadError } = await supabase
          .from('unidades')
          .update({ estado: 'vendido' })
          .eq('id', venta.unidad.id);
          
        if (unidadError) {
          console.error('Error al actualizar estado de unidad:', unidadError);
        }
      }
      
      toast({
        title: "Estado actualizado",
        description: `La venta ha sido marcada como "${newStatus}".`,
      });
      
      if (onSuccess) {
        await onSuccess();
      }
      
      return true;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la venta.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateVentaStatus,
    loading
  };
};

export default useVentaStatus;
