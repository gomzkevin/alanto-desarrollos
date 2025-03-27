
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { VentaWithDetail } from './types';

/**
 * Hook para obtener los detalles de una venta específica
 */
export const useVentaQuery = (ventaId?: string) => {
  // Fetch venta details
  const fetchVentaDetail = async (): Promise<VentaWithDetail | null> => {
    if (!ventaId) return null;
    
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            *,
            prototipo:prototipos(
              *,
              desarrollo:desarrollos(*)
            )
          )
        `)
        .eq('id', ventaId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener detalles de venta:', error);
      return null;
    }
  };

  return useQuery({
    queryKey: ['venta', ventaId],
    queryFn: fetchVentaDetail,
    enabled: !!ventaId,
  });
};

export default useVentaQuery;
