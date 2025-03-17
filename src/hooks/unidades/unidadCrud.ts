import { useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { updatePrototipoUnitCounts } from './updateUtils';
import { CreateMultipleUnidadesParams } from './types';

/**
 * Create a single unidad
 */
export const createUnidad = async (unidadData: any) => {
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

/**
 * Update a unidad
 */
export const updateUnidad = async ({ id, ...unidadData }: { id: string; [key: string]: any }) => {
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

/**
 * Delete a unidad
 */
export const deleteUnidad = async (id: string) => {
  const { error } = await supabase
    .from('unidades')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting unidad:', error);
    throw error;
  }
};

/**
 * Create multiple unidades at once
 */
export const createMultipleUnidadesFunc = async (
  { prototipo_id, cantidad, prefijo }: CreateMultipleUnidadesParams,
  queryClient: QueryClient
) => {
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
    await updatePrototipoUnitCounts(prototipo_id, queryClient);

    return data;
  } catch (error) {
    console.error('Error creating multiple unidades:', error);
    throw error;
  }
};

/**
 * Hook for creating multiple unidades
 */
export const useCreateMultipleUnidades = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: CreateMultipleUnidadesParams) => 
      createMultipleUnidadesFunc(params, queryClient),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unidades', variables.prototipo_id] });
      
      // Also invalidate the prototipo queries
      if (variables.prototipo_id) {
        queryClient.invalidateQueries({ queryKey: ['prototipo', variables.prototipo_id] });
      }
    }
  });
};

/**
 * Hook for creating a single unidad
 */
export const useCreateUnidad = (prototipoId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUnidad,
    onSuccess: () => {
      if (prototipoId) {
        queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
        updatePrototipoUnitCounts(prototipoId, queryClient);
      }
    }
  });
};

/**
 * Hook for updating a unidad
 */
export const useUpdateUnidad = (prototipoId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUnidad,
    onSuccess: () => {
      if (prototipoId) {
        queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
        updatePrototipoUnitCounts(prototipoId, queryClient);
      }
    }
  });
};

/**
 * Hook for deleting a unidad
 */
export const useDeleteUnidad = (prototipoId?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUnidad,
    onSuccess: () => {
      if (prototipoId) {
        queryClient.invalidateQueries({ queryKey: ['unidades', prototipoId] });
        updatePrototipoUnitCounts(prototipoId, queryClient);
      }
    }
  });
};
