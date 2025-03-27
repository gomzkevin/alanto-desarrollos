
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Pago } from '../usePagos';
import { Comprador } from './types';

/**
 * Hook para obtener los pagos asociados a los compradores de una venta
 */
export const usePagosQuery = (ventaId?: string, compradores: Comprador[] = []) => {
  const fetchPagos = async (): Promise<Pago[]> => {
    if (!ventaId || !compradores.length) return [];
    
    try {
      // Get all comprador_venta_ids for this venta
      const compradorVentaIds = compradores.map(c => c.id);
      
      if (!compradorVentaIds.length) return [];
      
      const { data, error } = await supabase
        .from('pagos')
        .select('*')
        .in('comprador_venta_id', compradorVentaIds)
        .order('fecha', { ascending: false });

      if (error) throw error;
      
      // Map the data to ensure estados conform to the expected type
      const typedPagos: Pago[] = (data || []).map(pago => ({
        ...pago,
        estado: pago.estado === 'rechazado' ? 'rechazado' : 'registrado'
      }));
      
      return typedPagos;
    } catch (error) {
      console.error('Error al obtener pagos de la venta:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['pagos-venta', ventaId, compradores],
    queryFn: fetchPagos,
    enabled: !!ventaId && compradores.length > 0,
  });
};

export default usePagosQuery;
