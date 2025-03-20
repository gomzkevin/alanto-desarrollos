
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnitSale = (unidadId: string | undefined) => {
  const [ventaId, setVentaId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchVentaId = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ventas')
        .select('id')
        .eq('unidad_id', id)
        .maybeSingle();

      if (error) throw error;
      setVentaId(data?.id);
      return data?.id;
    } catch (err) {
      console.error('Error fetching venta by unidad_id:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (unidadId) {
      fetchVentaId(unidadId);
    }
  }, [unidadId, fetchVentaId]);

  return { ventaId, isLoading, error, fetchVentaId };
};

export default useUnitSale;
