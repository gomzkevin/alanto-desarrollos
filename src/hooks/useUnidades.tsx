import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UnidadCount {
  disponibles: number;
  vendidas: number;
  con_anticipo: number;
  total: number;
}

export const useUnidades = (params?: { prototipo_id?: string }) => {
  const queryClient = useQueryClient();
  const prototipoId = params?.prototipo_id;

  // Function to fetch all unidades for a specific prototipo
  const fetchUnidades = async () => {
    if (!prototipoId) return [];

    const { data, error } = await supabase
      .from('unidades')
      .select(`
        *,
        prototipo:prototipos(id, nombre, precio)
      `)
      .eq('prototipo_id', prototipoId);

    if (error) {
      console.error('Error fetching unidades:', error);
      throw error;
    }

    return data || [];
  };

  // Count unidades by status
  const countUnidadesByStatus = async (prototipoId: string): Promise<UnidadCount> => {
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

  // Count unidades for a desarrollo by status
  const countDesarrolloUnidadesByStatus = async (desarrolloId: string): Promise<UnidadCount> => {
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

  // Create a unidad
  const createUnidad = async (unidadData: any) => {
    const { data, error } = await supabase
      .from('unidades')
      .insert(unidadData)
      .select();

    if (error) {
      console.error('Error creating unidad:', error);
      throw error;
    }

    return data;
  };

  // Create multiple unidades at once
  const createMultipleUnidades = useMutation({
    mutationFn: async ({ prototipo_id, cantidad, prefijo }: { prototipo_id: string, cantidad: number, prefijo?: string }) => {
      try {
        const unidades = [];
        for (let i = 0; i < cantidad; i++) {
          unidades.push({
            prototipo_id: prototipo_id,
            numero: prefijo ? `${prefijo}${i + 1}` : `Unidad ${i + 1}`,
            estado: 'disponible'
          });
        }

        const { data, error } = await supabase
          .from('unidades')
          .insert(unidades)
          .select();

        if (error) throw error;

        // After creating multiple unidades, update the prototipo's unit counts
        updatePrototipoUnitCounts(prototipo_id);

        return data;
      } catch (error) {
        console.error('Error creating multiple unidades:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
      
      // Also invalidate the prototipo and desarrollo queries
      if (prototipoId) {
        queryClient.invalidateQueries({ queryKey: ['prototipo', prototipoId] });
      }
    }
  });

  // Update a unidad
  const updateUnidad = async ({ id, ...unidadData }: { id: string; [key: string]: any }) => {
    const { data, error } = await supabase
      .from('unidades')
      .update(unidadData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating unidad:', error);
      throw error;
    }

    return data;
  };

  // Delete a unidad
  const deleteUnidad = async (id: string) => {
    const { error } = await supabase
      .from('unidades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting unidad:', error);
      throw error;
    }
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createUnidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
      
      // After creating/updating a unidad, we need to update the prototipo's unit counts
      if (prototipoId) {
        updatePrototipoUnitCounts(prototipoId);
      }
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateUnidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
      
      // After creating/updating a unidad, we need to update the prototipo's unit counts
      if (prototipoId) {
        updatePrototipoUnitCounts(prototipoId);
      }
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUnidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
      
      // After deleting a unidad, we need to update the prototipo's unit counts
      if (prototipoId) {
        updatePrototipoUnitCounts(prototipoId);
      }
    }
  });

  // Update prototipo unit counts
  const updatePrototipoUnitCounts = async (prototipoId: string) => {
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
        updateDesarrolloUnitCounts(prototipo.desarrollo_id);
      }
    } catch (error) {
      console.error('Error updating prototipo unit counts:', error);
    }
  };

  // Update desarrollo unit counts
  const updateDesarrolloUnitCounts = async (desarrolloId: string) => {
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

  // Use React Query to fetch unidades
  const { data: unidades = [], isLoading, error, refetch } = useQuery({
    queryKey: ['unidades', prototipoId],
    queryFn: fetchUnidades,
    enabled: !!prototipoId
  });

  return {
    unidades,
    isLoading,
    error,
    createUnidad: createMutation.mutate,
    updateUnidad: updateMutation.mutate,
    deleteUnidad: deleteMutation.mutate,
    createMultipleUnidades,
    refetch,
    countUnidadesByStatus,
    countDesarrolloUnidadesByStatus
  };
};

export default useUnidades;
