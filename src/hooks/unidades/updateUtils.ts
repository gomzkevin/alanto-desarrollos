
import { supabase } from '@/integrations/supabase/client';
import { countUnidadesByStatus } from './countUtils';
import { QueryClient } from '@tanstack/react-query';

/**
 * Update prototipo unit counts
 */
export const updatePrototipoUnitCounts = async (
  prototipoId: string,
  queryClient: QueryClient
) => {
  try {
    const counts = await countUnidadesByStatus(prototipoId);

    await supabase
      .from('prototipos')
      .update({
        unidades_disponibles: counts.disponibles,
        unidades_vendidas: counts.vendidas,
        unidades_con_anticipo: counts.con_anticipo
      })
      .eq('id', prototipoId);

    // After updating the prototipo, invalidate its cache
    queryClient.invalidateQueries({ queryKey: ['prototipos'] });
    queryClient.invalidateQueries({ queryKey: ['prototipo', prototipoId] });

    // Also update the desarrollo unit counts
    const { data: prototipo } = await supabase
      .from('prototipos')
      .select('desarrollo_id')
      .eq('id', prototipoId)
      .single();

    if (prototipo && prototipo.desarrollo_id) {
      await updateDesarrolloUnitCounts(prototipo.desarrollo_id, queryClient);
    }
  } catch (error) {
    console.error('Error updating prototipo unit counts:', error);
  }
};

/**
 * Update desarrollo unit counts
 */
export const updateDesarrolloUnitCounts = async (
  desarrolloId: string,
  queryClient: QueryClient
) => {
  try {
    // Get all prototipos for this desarrollo
    const { data: prototipos } = await supabase
      .from('prototipos')
      .select('unidades_disponibles, total_unidades')
      .eq('desarrollo_id', desarrolloId);

    if (!prototipos) return;

    // Calculate total and available units
    const totalUnidades = prototipos.reduce((sum, p) => sum + (p.total_unidades || 0), 0);
    const unidadesDisponibles = prototipos.reduce((sum, p) => sum + (p.unidades_disponibles || 0), 0);

    // Update the desarrollo
    await supabase
      .from('desarrollos')
      .update({
        total_unidades: totalUnidades,
        unidades_disponibles: unidadesDisponibles
      })
      .eq('id', desarrolloId);

    // Invalidate desarrollo cache
    queryClient.invalidateQueries({ queryKey: ['desarrollos'] });
    queryClient.invalidateQueries({ queryKey: ['desarrollo', desarrolloId] });
  } catch (error) {
    console.error('Error updating desarrollo unit counts:', error);
  }
};
