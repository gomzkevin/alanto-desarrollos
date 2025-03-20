
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnitSale = (unidadId: string | undefined) => {
  const [ventaId, setVentaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVentaId = useCallback(async (id: string) => {
    if (!id) return null;
    
    try {
      setIsLoading(true);
      console.log('Fetching venta for unidad_id:', id);
      
      const { data, error } = await supabase
        .from('ventas')
        .select('id')
        .eq('unidad_id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching venta by unidad_id:', error);
        throw error;
      }
      
      console.log('Venta data returned:', data);
      
      if (data) {
        setVentaId(data.id);
        return data.id;
      } else {
        setVentaId(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching venta by unidad_id:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unidadId) {
      console.log('useUnitSale triggered for unidadId:', unidadId);
      fetchVentaId(unidadId);
    } else {
      // Limpiar el estado cuando no hay unidadId
      setVentaId(null);
    }
  }, [unidadId, fetchVentaId]);

  return { ventaId, isLoading, error, fetchVentaId };
};

export default useUnitSale;
