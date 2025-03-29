
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { Tables } from '@/integrations/supabase/types';

export type Desarrollo = Tables<"desarrollos">;

export type DesarrolloExtended = Desarrollo & {
  imagen_principal?: string;
  total_prototipos?: number;
  total_unidades?: number;
  unidades_disponibles_total?: number;
  unidades_vendidas_total?: number;
};

type FetchDesarrollosOptions = {
  withStats?: boolean;
  staleTime?: number;
  limit?: number;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { withStats = true, staleTime = 60000, limit } = options;
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();

  const fetchDesarrollos = async (): Promise<DesarrolloExtended[]> => {
    if (!empresaId) {
      console.log('No empresaId available, returning empty array');
      return [];
    }

    try {
      // Optimización: usar selección específica de columnas para reducir el tamaño de los datos
      let query = supabase
        .from('desarrollos')
        .select(`
          *,
          prototipos:prototipos(
            id, 
            unidades_vendidas,
            unidades_disponibles,
            total_unidades
          )
        `)
        .eq('empresa_id', empresaId)
        .order('nombre');

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching desarrollos:', error);
        throw error;
      }

      const imagenQuery = await supabase
        .from('desarrollo_imagenes')
        .select('desarrollo_id, url')
        .in('desarrollo_id', data.map(d => d.id))
        .eq('es_principal', true);

      // Procesamiento de datos
      return data.map(desarrollo => {
        // Manejo seguro de amenidades
        let amenidadesArray: string[] = [];
        if (desarrollo && 'amenidades' in desarrollo && desarrollo.amenidades) {
          try {
            if (typeof desarrollo.amenidades === 'string') {
              amenidadesArray = JSON.parse(desarrollo.amenidades);
            } else if (Array.isArray(desarrollo.amenidades)) {
              amenidadesArray = desarrollo.amenidades.map(val => String(val));
            } else if (typeof desarrollo.amenidades === 'object' && desarrollo.amenidades !== null) {
              amenidadesArray = Object.values(desarrollo.amenidades).map(val => String(val));
            }
          } catch (e) {
            console.error('Error parsing amenidades:', e);
          }
        }

        // Buscar imagen principal
        const imagenPrincipal = imagenQuery.data?.find(
          img => img.desarrollo_id === desarrollo.id
        )?.url || desarrollo.imagen_url;

        // Calcular estadísticas si se solicitan
        let stats = {};
        if (withStats && desarrollo.prototipos) {
          const totalPrototipos = desarrollo.prototipos.length;
          const totalUnidades = desarrollo.prototipos.reduce(
            (sum, p) => sum + (p.total_unidades || 0), 0
          );
          const unidadesDisponiblesTotal = desarrollo.prototipos.reduce(
            (sum, p) => sum + (p.unidades_disponibles || 0), 0
          );
          const unidadesVendidasTotal = desarrollo.prototipos.reduce(
            (sum, p) => sum + (p.unidades_vendidas || 0), 0
          );

          stats = {
            total_prototipos: totalPrototipos,
            total_unidades: totalUnidades,
            unidades_disponibles_total: unidadesDisponiblesTotal,
            unidades_vendidas_total: unidadesVendidasTotal
          };
        }

        return {
          ...desarrollo,
          imagen_principal: imagenPrincipal,
          amenidades: amenidadesArray,
          ...stats
        };
      });
    } catch (error) {
      console.error('Error in fetchDesarrollos:', error);
      return [];
    }
  };

  const queryResult = useQuery({
    queryKey: ['desarrollos', empresaId, withStats, limit],
    queryFn: fetchDesarrollos,
    enabled: !!empresaId && !isUserRoleLoading,
    staleTime: staleTime,
    refetchOnWindowFocus: false
  });

  // Agregar propiedad desarrollos para compatibilidad
  return {
    ...queryResult,
    desarrollos: queryResult.data || []
  };
}

export default useDesarrollos;
