
import { supabase } from '@/integrations/supabase/client';
import { DesarrolloExtended } from './types';
import { processAmenidades, calculateDesarrolloStats } from './processingUtils';

/**
 * Fetches desarrollos data with optional filtering and processing
 */
export async function fetchDesarrollos(
  empresaId: number | null, 
  withStats: boolean = true,
  limit?: number
): Promise<DesarrolloExtended[]> {
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
      // Process amenidades
      const amenidadesArray = processAmenidades(desarrollo);

      // Buscar imagen principal
      const imagenPrincipal = imagenQuery.data?.find(
        img => img.desarrollo_id === desarrollo.id
      )?.url || desarrollo.imagen_url;

      // Calculate statistics if requested
      const stats = calculateDesarrolloStats(desarrollo, withStats);

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
}
