
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnitSale = (unidadId: string | undefined) => {
  const [ventaId, setVentaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Función para buscar la venta asociada a una unidad
  const fetchVentaId = useCallback(async (id: string): Promise<string | null> => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Buscando venta para unidad_id: ${id}`);
      
      const { data, error } = await supabase
        .from('ventas')
        .select('id')
        .eq('unidad_id', id)
        .maybeSingle();

      if (error) {
        console.error('Error al buscar venta por unidad_id:', error);
        throw error;
      }
      
      console.log('Resultado de búsqueda de venta:', data);
      
      if (data) {
        return data.id;
      }
      
      return null;
    } catch (err) {
      console.error('Error en fetchVentaId:', err);
      setError(err instanceof Error ? err : new Error('Error desconocido'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Efecto para buscar la venta cuando cambia el ID de la unidad
  useEffect(() => {
    let isMounted = true;
    
    if (unidadId) {
      console.log('useUnitSale: buscando venta para unidad:', unidadId);
      
      // Limpiar estado previo
      setVentaId(null);
      setError(null);
      setIsLoading(true);
      
      // Buscar la venta
      fetchVentaId(unidadId).then(id => {
        if (isMounted) {
          setVentaId(id);
          setIsLoading(false);
        }
      }).catch(err => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      });
    } else {
      // Limpiar estado cuando no hay unidadId
      setVentaId(null);
      setError(null);
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [unidadId, fetchVentaId]);

  // Función para esperar a que se cree una venta
  const waitForVenta = useCallback(async (id: string, maxAttempts = 5): Promise<string | null> => {
    if (!id) return null;
    
    console.log(`Esperando creación de venta para unidad: ${id}`);
    
    // Implementar espera con reintentos
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Intento ${attempt}/${maxAttempts}`);
      
      const ventaId = await fetchVentaId(id);
      if (ventaId) {
        console.log(`Venta encontrada en intento ${attempt}: ${ventaId}`);
        setVentaId(ventaId);
        return ventaId;
      }
      
      // Esperar antes del siguiente intento (tiempo creciente)
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 800 * attempt));
      }
    }
    
    console.log(`No se encontró venta después de ${maxAttempts} intentos`);
    return null;
  }, [fetchVentaId]);

  return { ventaId, isLoading, error, fetchVentaId, waitForVenta };
};

export default useUnitSale;
