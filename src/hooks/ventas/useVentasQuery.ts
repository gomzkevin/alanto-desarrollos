import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '../useUserRole';
import { Prototipo } from '../usePrototipos';

type Venta = {
  id: string;
  created_at: string;
  lead_id: string;
  prototipo: {
    id: string;
    nombre: string;
    precio: number;
    desarrollo: {
      id: string;
      nombre: string;
      empresa_id: number;
    };
  };
};

type FetchVentasOptions = {
  limit?: number;
  desarrolloId?: string;
};

export const useVentasQuery = (options: FetchVentasOptions = {}) => {
  const { limit = 10, desarrolloId } = options;
  const { empresaId } = useUserRole();

  const fetchVentas = async (): Promise<Venta[]> => {
    if (!empresaId) {
      console.log('No empresaId available, returning empty array');
      return [];
    }

    try {
      let query = supabase
        .from('ventas')
        .select(`
          id,
          created_at,
          lead_id,
          prototipo:prototipos(
            id,
            nombre,
            precio,
            desarrollo:desarrollos(
              id,
              nombre,
              empresa_id
            )
          )
        `)
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ventas:', error);
        throw error;
      }

      // Filter prototipos based on desarrolloId
      const filteredVentas = (data as any[]).filter(venta => {
        const prototipo = venta.prototipo;
        if (!prototipo) return false;
        return !desarrolloId || (prototipo.desarrollo && prototipo.desarrollo.id === desarrolloId);
      });

      console.log('Ventas fetched:', filteredVentas.length, 'results');
      return filteredVentas as Venta[];
    } catch (error) {
      console.error('Error in fetchVentas:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['ventas', limit, empresaId, desarrolloId],
    queryFn: fetchVentas,
    enabled: !!empresaId,
    refetchOnWindowFocus: false
  });
};
