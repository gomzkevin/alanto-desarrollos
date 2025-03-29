
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comprador } from './types';

const fetchCompradores = async (ventaId: string): Promise<Comprador[]> => {
  if (!ventaId) return [];

  try {
    const { data, error } = await supabase
      .from('compradores_venta')
      .select(`
        id,
        comprador_id,
        porcentaje_propiedad,
        monto_comprometido,
        venta_id,
        comprador:comprador_id (
          id,
          nombre,
          email,
          telefono
        )
      `)
      .eq('venta_id', ventaId);

    if (error) throw error;

    // Format the data to match the Comprador type
    return data.map(item => ({
      id: item.id,
      nombre: item.comprador?.nombre || '',
      email: item.comprador?.email || '',
      telefono: item.comprador?.telefono || '',
      porcentaje_propiedad: item.porcentaje_propiedad,
      monto_comprometido: item.monto_comprometido
    }));
  } catch (error) {
    console.error('Error fetching compradores:', error);
    throw error;
  }
};

export const useCompradoresQuery = (ventaId?: string) => {
  const queryKey = useCallback(() => ['compradores', ventaId], [ventaId]);

  const query = useQuery({
    queryKey: queryKey(),
    queryFn: () => fetchCompradores(ventaId || ''),
    enabled: !!ventaId,
  });

  return query;
};
