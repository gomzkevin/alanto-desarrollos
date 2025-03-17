
import { supabase } from '@/integrations/supabase/client';
import { UnidadCount } from './types';

/**
 * Count unidades by status for a specific prototipo
 */
export const countUnidadesByStatus = async (prototipoId: string): Promise<UnidadCount> => {
  try {
    const { data, error } = await supabase
      .from('unidades')
      .select('estado')
      .eq('prototipo_id', prototipoId);

    if (error) throw error;

    const counts: UnidadCount = {
      disponibles: 0,
      vendidas: 0,
      con_anticipo: 0,
      total: 0
    };

    if (data) {
      counts.total = data.length;
      data.forEach(unidad => {
        if (unidad.estado === 'disponible') {
          counts.disponibles++;
        } else if (unidad.estado === 'vendido') {
          counts.vendidas++;
        } else if (unidad.estado === 'en_proceso' || unidad.estado === 'apartado') {
          counts.con_anticipo++;
        }
      });
    }

    return counts;
  } catch (error) {
    console.error('Error counting unidades by status:', error);
    return { disponibles: 0, vendidas: 0, con_anticipo: 0, total: 0 };
  }
};

/**
 * Count unidades for a desarrollo by status
 */
export const countDesarrolloUnidadesByStatus = async (desarrolloId: string): Promise<UnidadCount> => {
  try {
    // First get all prototipos for this desarrollo
    const { data: prototipos, error: prototiposError } = await supabase
      .from('prototipos')
      .select('id')
      .eq('desarrollo_id', desarrolloId);

    if (prototiposError) throw prototiposError;
    if (!prototipos || prototipos.length === 0) {
      return { disponibles: 0, vendidas: 0, con_anticipo: 0, total: 0 };
    }

    // Get all unidades for these prototipos
    const prototipoIds = prototipos.map(p => p.id);
    const { data: unidades, error: unidadesError } = await supabase
      .from('unidades')
      .select('estado')
      .in('prototipo_id', prototipoIds);

    if (unidadesError) throw unidadesError;

    const counts: UnidadCount = {
      disponibles: 0,
      vendidas: 0,
      con_anticipo: 0,
      total: 0
    };

    if (unidades) {
      counts.total = unidades.length;
      unidades.forEach(unidad => {
        if (unidad.estado === 'disponible') {
          counts.disponibles++;
        } else if (unidad.estado === 'vendido') {
          counts.vendidas++;
        } else if (unidad.estado === 'en_proceso' || unidad.estado === 'apartado') {
          counts.con_anticipo++;
        }
      });
    }

    return counts;
  } catch (error) {
    console.error('Error counting desarrollo unidades by status:', error);
    return { disponibles: 0, vendidas: 0, con_anticipo: 0, total: 0 };
  }
};
