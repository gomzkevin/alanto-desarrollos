
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnitSale = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Función simplificada para buscar la venta asociada a una unidad
  const fetchVentaId = useCallback(async (unidadId: string): Promise<string | null> => {
    if (!unidadId) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Buscando venta para unidad_id: ${unidadId}`);
      
      const { data, error } = await supabase
        .from('ventas')
        .select('id')
        .eq('unidad_id', unidadId)
        .maybeSingle();

      if (error) {
        console.error('Error al buscar venta por unidad_id:', error);
        throw error;
      }
      
      console.log('Resultado de búsqueda de venta:', data);
      return data?.id || null;
    } catch (err) {
      console.error('Error en fetchVentaId:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchVentaId, isLoading, error };
};

export default useUnitSale;
