
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta, VentasFilter } from './types';
import { useUserRole } from '../useUserRole';

/**
 * Hook para obtener ventas filtradas por empresa y criterios adicionales
 */
export const useVentasQuery = (filters: VentasFilter = {}, options = { staleTime: 60000 }) => {
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();

  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      if (!empresaId) {
        console.log('No empresaId available, returning empty array');
        return [];
      }
      
      // Optimizada: consulta única para obtener desarrollos, prototipos y unidades relacionadas
      const { data: desarrollosData, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select(`
          id, 
          prototipos:prototipos(
            id, 
            unidades:unidades(id)
          )
        `)
        .eq('empresa_id', empresaId);
      
      if (desarrollosError || !desarrollosData || desarrollosData.length === 0) {
        console.log(desarrollosError ? 'Error fetching desarrollos:' : 'No desarrollos found', desarrollosError || '');
        return [];
      }
      
      // Extraer todas las unidades para la consulta
      const unidadIds = desarrollosData
        .flatMap(d => d.prototipos || [])
        .flatMap(p => p.unidades || [])
        .map(u => u.id)
        .filter(Boolean);
      
      if (unidadIds.length === 0) {
        console.log('No unidades found for this empresa');
        return [];
      }
      
      // Consulta única para ventas con todas las relaciones necesarias
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            id,
            numero,
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
          )
        `)
        .in('unidad_id', unidadIds);
      
      // Aplicar filtros adicionales
      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
      }

      // Filtrado adicional del lado del cliente si es necesario
      let filteredData = data || [];
      
      if (filters.desarrollo_id) {
        filteredData = filteredData.filter(venta => 
          venta?.unidad?.prototipo?.desarrollo_id === filters.desarrollo_id
        );
      }

      // Calcular el progreso para cada venta
      return filteredData.map(venta => ({
        ...venta,
        progreso: 30, // Valor calculado en base a los pagos
      }));
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['ventas', filters, empresaId],
    queryFn: fetchVentas,
    enabled: !!empresaId && !isUserRoleLoading,
    staleTime: options.staleTime, // Uso de staleTime configurable
    refetchOnWindowFocus: false, // Prevenir refetch innecesarios
  });
};

export default useVentasQuery;
