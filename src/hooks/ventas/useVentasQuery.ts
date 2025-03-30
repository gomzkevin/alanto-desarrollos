
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venta, VentasFilter } from './types';
import { useUserRole } from '../useUserRole';

/**
 * Hook para obtener ventas filtradas por empresa y criterios adicionales
 */
export const useVentasQuery = (filters: VentasFilter = {}) => {
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();

  const fetchVentas = async (): Promise<Venta[]> => {
    try {
      console.log('Fetching ventas with filters:', filters, 'empresaId:', empresaId);
      
      if (!empresaId) {
        console.log('No empresaId available, returning empty array');
        return [];
      }
      
      // Get desarrollos for the empresa first - this ensures we only get data for the current company
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id')
        .eq('empresa_id', empresaId);
      
      if (desarrollosError) {
        console.error('Error fetching desarrollos:', desarrollosError);
        return [];
      }
      
      if (!desarrollos || desarrollos.length === 0) {
        console.log('No desarrollos found for empresa_id:', empresaId);
        return [];
      }
      
      // Get the desarrollo IDs for this company only
      const desarrolloIds = desarrollos.map(d => d.id);
      console.log('Filtering ventas by desarrollos:', desarrolloIds);
      
      // Now fetch prototipos associated with these desarrollos
      const { data: prototipos, error: prototipesError } = await supabase
        .from('prototipos')
        .select('id, desarrollo_id')
        .in('desarrollo_id', desarrolloIds);
      
      if (prototipesError) {
        console.error('Error fetching prototipos:', prototipesError);
        return [];
      }
      
      if (!prototipos || prototipos.length === 0) {
        console.log('No prototipos found for the desarrollos');
        return [];
      }
      
      // Get the prototipo IDs
      const prototipoIds = prototipos.map(p => p.id);
      
      // Get unidades for these prototipos
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, prototipo_id')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) {
        console.error('Error fetching unidades:', unidadesError);
        return [];
      }
      
      if (!unidades || unidades.length === 0) {
        console.log('No unidades found for the prototipos');
        return [];
      }
      
      // Get the unidad IDs
      const unidadIds = unidades.map(u => u.id);
      
      // Now fetch ventas filtered by these unidades
      let query = supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            id,
            numero,
            prototipo_id,
            prototipo:prototipos(
              nombre,
              desarrollo_id,
              desarrollo:desarrollos(
                nombre,
                empresa_id
              )
            )
          )
        `)
        .in('unidad_id', unidadIds);
      
      // Apply additional filters if they exist
      if (filters.estado && filters.estado !== 'todos') {
        query = query.eq('estado', filters.estado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error al obtener ventas:', error);
        throw error;
      }

      console.log('Ventas fetched:', data?.length || 0, 'results');
      
      // Additional client-side filtering if needed
      let filteredData = data || [];
      
      if (filters.desarrollo_id) {
        filteredData = filteredData.filter(venta => 
          venta?.unidad?.prototipo?.desarrollo_id === filters.desarrollo_id
        );
      }

      // Calcular el progreso para cada venta
      return filteredData.map(venta => ({
        ...venta,
        progreso: 30, // Este sería un valor calculado en base a los pagos
      }));
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      return [];
    }
  };

  return useQuery({
    queryKey: ['ventas', filters, empresaId],
    queryFn: fetchVentas,
    enabled: !!empresaId && !isUserRoleLoading, // Only run the query if empresaId exists and user role is loaded
    staleTime: 1000 * 60 * 5, // 5 minutos
    // Prevenir múltiples renderizaciones con estos ajustes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    // Prevenir que muestre estado de cargando cuando tenemos datos en caché
    placeholderData: (previousData) => previousData || [],
  });
};

export default useVentasQuery;
