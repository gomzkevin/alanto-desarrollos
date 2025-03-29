
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comprador } from './types';

export const useCompradoresQuery = (ventaId?: string) => {
  const fetchCompradores = async (): Promise<Comprador[]> => {
    if (!ventaId) return [];
    
    try {
      // Get compradores_venta records
      const { data: compradoresVenta, error } = await supabase
        .from('compradores_venta')
        .select(`
          id,
          comprador_id,
          porcentaje_propiedad,
          monto_comprometido,
          usuarios:comprador_id(
            nombre,
            email,
            telefono
          )
        `)
        .eq('venta_id', ventaId);
        
      if (error) {
        console.error('Error fetching compradores:', error);
        return [];
      }
      
      if (!compradoresVenta || compradoresVenta.length === 0) {
        return [];
      }
      
      // Map data to the required format
      return compradoresVenta.map(item => ({
        id: item.id,
        nombre: item.usuarios?.nombre || 'Sin nombre',
        email: item.usuarios?.email || '',
        telefono: item.usuarios?.telefono || '',
        porcentaje_propiedad: item.porcentaje_propiedad,
        monto_comprometido: item.monto_comprometido
      }));
    } catch (err) {
      console.error('Error in fetchCompradores:', err);
      return [];
    }
  };
  
  return useQuery({
    queryKey: ['compradores', ventaId],
    queryFn: fetchCompradores,
    enabled: !!ventaId
  });
};

export default useCompradoresQuery;
