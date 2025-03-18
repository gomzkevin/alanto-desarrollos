
import { useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { updatePrototipoUnitCounts } from './updateUtils';
import { CreateMultipleUnidadesParams } from './types';

/**
 * Create a single unidad
 */
export const createUnidad = async (unidadData: any) => {
  console.log('Creating unidad with data:', unidadData);
  
  try {
    // Format precio_venta if it's a string with currency formatting
    if (typeof unidadData.precio_venta === 'string') {
      if (unidadData.precio_venta.includes('$') || unidadData.precio_venta.includes(',')) {
        unidadData.precio_venta = parseFloat(unidadData.precio_venta.replace(/[$,]/g, ''));
      }
    }
    
    const { data, error } = await supabase
      .from('unidades')
      .insert(unidadData)
      .select();

    if (error) {
      console.error('Error creating unidad:', error);
      throw error;
    }

    console.log('Unidad created successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in createUnidad:', error);
    throw error;
  }
};

/**
 * Update a unidad
 */
export const updateUnidad = async ({ id, ...unidadData }: { id: string; [key: string]: any }) => {
  console.log('Updating unidad:', id, 'with data:', unidadData);
  
  try {
    // Format precio_venta if it's a string with currency formatting
    if (typeof unidadData.precio_venta === 'string') {
      if (unidadData.precio_venta.includes('$') || unidadData.precio_venta.includes(',')) {
        unidadData.precio_venta = parseFloat(unidadData.precio_venta.replace(/[$,]/g, ''));
      }
    }
    
    const { data, error } = await supabase
      .from('unidades')
      .update(unidadData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating unidad:', error);
      throw error;
    }

    console.log('Unidad updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Exception in updateUnidad:', error);
    throw error;
  }
};

/**
 * Delete a unidad
 */
export const deleteUnidad = async (id: string) => {
  console.log('Deleting unidad:', id);
  
  try {
    const { error } = await supabase
      .from('unidades')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting unidad:', error);
      throw error;
    }
    
    console.log('Unidad deleted successfully');
  } catch (error) {
    console.error('Exception in deleteUnidad:', error);
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
    console.log(`Creating ${cantidad} unidades with prefix "${prefijo}" for prototipo ${prototipo_id}`);
    
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

    console.log(`Successfully created ${unidades.length} unidades`);

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
      // Invalidate related queries to trigger refetches
      if (variables.prototipo_id) {
        console.log('Invalidating queries after creating multiple unidades');
        
        // Force refetch all related queries
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', variables.prototipo_id],
          refetchType: 'all'
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['prototipo', variables.prototipo_id],
          refetchType: 'all'
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['prototipos'],
          refetchType: 'all'
        });
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
        console.log('Successfully created unidad, invalidating queries');
        
        // Force refetch all related queries
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', prototipoId],
          refetchType: 'all'
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['prototipo', prototipoId],
          refetchType: 'all'
        });
        
        queryClient.invalidateQueries({ 
          queryKey: ['prototipos'],
          refetchType: 'all'
        });
        
        // Update counts
        updatePrototipoUnitCounts(prototipoId, queryClient);
      }
    },
    onError: (error) => {
      console.error('Error in useCreateUnidad mutation:', error);
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
        console.log('Successfully updated unidad, invalidating queries');
        
        // Force refetch all related queries
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: ['unidades', prototipoId],
            refetchType: 'all'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['prototipo', prototipoId],
            refetchType: 'all'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['prototipos'],
            refetchType: 'all'
          });
          
          // Update counts
          updatePrototipoUnitCounts(prototipoId, queryClient);
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Error in useUpdateUnidad mutation:', error);
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
        console.log('Successfully deleted unidad, invalidating queries');
        
        // Force refetch all related queries
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: ['unidades', prototipoId],
            refetchType: 'all'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['prototipo', prototipoId],
            refetchType: 'all'
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['prototipos'],
            refetchType: 'all'
          });
          
          // Update counts
          updatePrototipoUnitCounts(prototipoId, queryClient);
        }, 500);
      }
    },
    onError: (error) => {
      console.error('Error in useDeleteUnidad mutation:', error);
    }
  });
};
