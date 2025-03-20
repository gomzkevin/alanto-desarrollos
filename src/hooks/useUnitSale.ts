
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUnitSale = (unidadId: string | undefined) => {
  const [ventaId, setVentaId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mejorado para incluir reintentos y manejo de errores consistente
  const fetchVentaId = useCallback(async (id: string) => {
    if (!id) return null;
    
    setIsLoading(true);
    setError(null);
    
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        console.log(`Attempt ${attempts}: Fetching venta for unidad_id: ${id}`);
        
        const { data, error } = await supabase
          .from('ventas')
          .select('id')
          .eq('unidad_id', id)
          .maybeSingle();

        if (error) {
          console.error(`Attempt ${attempts}: Error fetching venta by unidad_id:`, error);
          
          // Si es el último intento, lanzamos el error
          if (attempts === maxAttempts) throw error;
          
          // Esperamos un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 800));
          continue;
        }
        
        console.log(`Attempt ${attempts}: Venta data returned:`, data);
        
        if (data) {
          setVentaId(data.id);
          setIsLoading(false);
          return data.id;
        }
        
        // Si estamos en el último intento y no hay datos, terminamos
        if (attempts === maxAttempts) {
          setVentaId(null);
          setIsLoading(false);
          return null;
        }
        
        // Esperamos un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (err) {
        console.error(`Attempt ${attempts}: Error in fetchVentaId:`, err);
        
        // Si es el último intento, establecemos el error
        if (attempts === maxAttempts) {
          setError(err instanceof Error ? err : new Error('Error desconocido'));
          setIsLoading(false);
          return null;
        }
        
        // Esperamos un poco antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    
    setIsLoading(false);
    return null;
  }, []);

  // Mejorado para manejar cambios de ID
  useEffect(() => {
    let isMounted = true;
    
    if (unidadId) {
      console.log('useUnitSale triggered for unidadId:', unidadId);
      
      // Limpiamos el estado anterior inmediatamente
      setVentaId(null);
      
      // Iniciamos la búsqueda
      fetchVentaId(unidadId).then(id => {
        if (isMounted && id) {
          setVentaId(id);
        }
      });
    } else {
      // Limpiamos el estado cuando no hay unidadId
      setVentaId(null);
      setError(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [unidadId, fetchVentaId]);

  return { ventaId, isLoading, error, fetchVentaId };
};

export default useUnitSale;
