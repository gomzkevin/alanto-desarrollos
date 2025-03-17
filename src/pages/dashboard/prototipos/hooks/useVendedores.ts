
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVendedores = () => {
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchVendedores = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('rol', 'vendedor')
          .eq('activo', true);
          
        if (error) throw error;
        setVendedores(data || []);
      } catch (error) {
        console.error('Error fetching vendedores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVendedores();
  }, []);
  
  return { vendedores, isLoading };
};

export default useVendedores;
