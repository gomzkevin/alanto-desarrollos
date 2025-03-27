
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comprador } from './types';

/**
 * Hook para obtener los compradores asociados a una venta
 */
export const useCompradoresQuery = (ventaId?: string) => {
  const fetchCompradores = async (): Promise<Comprador[]> => {
    if (!ventaId) return [];
    
    try {
      const { data, error } = await supabase
        .from('compradores_venta')
        .select(`
          *,
          comprador:leads(id, nombre)
        `)
        .eq('venta_id', ventaId);

      if (error) throw error;

      // Count pagos for each comprador
      const compradoresWithPagos = await Promise.all(
        data.map(async (item) => {
          const { count, error: pagosError } = await supabase
            .from('pagos')
            .select('id', { count: 'exact', head: true })
            .eq('comprador_venta_id', item.id)
            .eq('estado', 'registrado');
            
          return {
            id: item.id,
            comprador_id: item.comprador_id,
            nombre: item.comprador?.nombre || 'Comprador sin nombre',
            porcentaje: item.porcentaje_propiedad,
            pagos_realizados: count || 0,
          };
        })
      );

      return compradoresWithPagos;
    } catch (error) {
      console.error('Error al obtener compradores:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['compradores', ventaId],
    queryFn: fetchCompradores,
    enabled: !!ventaId,
  });
};

export default useCompradoresQuery;
