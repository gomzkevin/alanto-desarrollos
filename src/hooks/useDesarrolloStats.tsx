
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get statistics for a desarrollo based on units status
 */
export function useDesarrolloStats(desarrolloId?: string) {
  return useQuery({
    queryKey: ['desarrollo-stats', desarrolloId],
    queryFn: async () => {
      if (!desarrolloId) {
        return { 
          unidadesDisponibles: 0, 
          avanceComercial: 0,
          totalUnidades: 0
        };
      }

      // Get all prototipos for this desarrollo
      const { data: prototipos, error: prototiposError } = await supabase
        .from('prototipos')
        .select('id, total_unidades')
        .eq('desarrollo_id', desarrolloId);

      if (prototiposError) {
        console.error('Error fetching prototipos:', prototiposError);
        throw prototiposError;
      }

      // If no prototipos, return default values
      if (!prototipos || prototipos.length === 0) {
        return { 
          unidadesDisponibles: 0, 
          avanceComercial: 0,
          totalUnidades: 0 
        };
      }

      // Get all unidades with their status
      let totalUnidades = 0;
      let unidadesDisponibles = 0;

      // Calculate total units from prototipos
      totalUnidades = prototipos.reduce((sum, prototipo) => sum + (prototipo.total_unidades || 0), 0);

      // For each prototipo, get units with "disponible" status
      const allUnits = await Promise.all(
        prototipos.map(async (prototipo) => {
          const { data: unidades, error: unidadesError } = await supabase
            .from('unidades')
            .select('estado')
            .eq('prototipo_id', prototipo.id);

          if (unidadesError) {
            console.error('Error fetching unidades:', unidadesError);
            return [];
          }

          return unidades || [];
        })
      );

      // Flatten units array
      const allUnidades = allUnits.flat();
      
      // Count units with "disponible" status
      unidadesDisponibles = allUnidades.filter(unidad => 
        unidad.estado === 'disponible'
      ).length;

      // Calculate commercial progress percentage
      let avanceComercial = 0;
      if (totalUnidades > 0) {
        const unidadesNoDisponibles = totalUnidades - unidadesDisponibles;
        avanceComercial = Math.round((unidadesNoDisponibles / totalUnidades) * 100);
      }

      return {
        unidadesDisponibles,
        avanceComercial,
        totalUnidades
      };
    },
    enabled: !!desarrolloId
  });
}

export default useDesarrolloStats;
