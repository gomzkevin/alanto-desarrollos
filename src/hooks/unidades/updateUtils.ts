
import { supabase } from '@/integrations/supabase/client';
import { countUnidadesByStatus } from './countUtils';
import { QueryClient } from '@tanstack/react-query';

/**
 * Update prototipo unit counts with throttling
 */
export const updatePrototipoUnitCounts = async (
  prototipoId: string,
  queryClient: QueryClient
) => {
  try {
    console.log(`Updating counts for prototipo: ${prototipoId}`);
    const counts = await countUnidadesByStatus(prototipoId);
    console.log(`Count results:`, counts);

    const { data, error } = await supabase
      .from('prototipos')
      .update({
        unidades_disponibles: counts.disponibles,
        unidades_vendidas: counts.vendidas,
        unidades_con_anticipo: counts.con_anticipo
      })
      .eq('id', prototipoId)
      .select();

    if (error) {
      console.error('Error updating prototipo unit counts:', error);
      throw error;
    }

    console.log(`Updated prototipo ${prototipoId} with counts:`, {
      disponibles: counts.disponibles,
      vendidas: counts.vendidas,
      con_anticipo: counts.con_anticipo
    });

    // Invalidar de forma controlada sin causar refrescos inmediatos
    setTimeout(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['prototipos'],
        refetchType: 'none'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['prototipo', prototipoId],
        refetchType: 'none'
      });
    }, 1000);

    // Also update the desarrollo unit counts with delay
    const { data: prototipo } = await supabase
      .from('prototipos')
      .select('desarrollo_id')
      .eq('id', prototipoId)
      .single();

    if (prototipo && prototipo.desarrollo_id) {
      // Añadir retraso para evitar múltiples actualizaciones en cascada
      setTimeout(() => {
        updateDesarrolloUnitCounts(prototipo.desarrollo_id, queryClient);
      }, 2000);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating prototipo unit counts:', error);
    throw error;
  }
};

/**
 * Update desarrollo unit counts with throttling
 */
export const updateDesarrolloUnitCounts = async (
  desarrolloId: string,
  queryClient: QueryClient
) => {
  try {
    console.log(`Updating counts for desarrollo: ${desarrolloId}`);
    
    // Get all prototipos for this desarrollo
    const { data: prototipos, error: prototiposError } = await supabase
      .from('prototipos')
      .select('unidades_disponibles, total_unidades')
      .eq('desarrollo_id', desarrolloId);

    if (prototiposError) {
      console.error('Error fetching prototipos for desarrollo:', prototiposError);
      throw prototiposError;
    }

    if (!prototipos || prototipos.length === 0) {
      console.log(`No prototipos found for desarrollo ${desarrolloId}`);
      return;
    }

    // Calculate total and available units
    const totalUnidades = prototipos.reduce((sum, p) => sum + (p.total_unidades || 0), 0);
    const unidadesDisponibles = prototipos.reduce((sum, p) => sum + (p.unidades_disponibles || 0), 0);
    
    console.log(`Calculated for desarrollo ${desarrolloId}:`, {
      totalUnidades,
      unidadesDisponibles
    });

    // Update the desarrollo with throttling
    const { data, error } = await supabase
      .from('desarrollos')
      .update({
        total_unidades: totalUnidades,
        unidades_disponibles: unidadesDisponibles
      })
      .eq('id', desarrolloId)
      .select();

    if (error) {
      console.error('Error updating desarrollo unit counts:', error);
      throw error;
    }

    console.log(`Updated desarrollo ${desarrolloId} with counts:`, {
      totalUnidades,
      unidadesDisponibles
    });

    // Invalidar cache de forma controlada sin causar refrescos inmediatos
    setTimeout(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['desarrollos'],
        refetchType: 'none'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['desarrollo', desarrolloId],
        refetchType: 'none'
      });
    }, 1500);
    
    return data;
  } catch (error) {
    console.error('Error updating desarrollo unit counts:', error);
    throw error;
  }
};
