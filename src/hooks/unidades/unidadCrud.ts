
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
      } else if (unidadData.precio_venta === '') {
        unidadData.precio_venta = null;
      }
    }
    
    // Handle empty date values
    if (unidadData.fecha_venta === '') {
      unidadData.fecha_venta = null;
    }
    
    // Asegurarse de que el estado esté presente
    if (!unidadData.estado) {
      unidadData.estado = 'disponible';
    }
    
    // Validación de campos clave para reducir errores
    const requiredFields = ['numero', 'prototipo_id', 'estado'];
    for (const field of requiredFields) {
      if (!unidadData[field]) {
        throw new Error(`El campo ${field} es requerido para crear una unidad`);
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
    // Validar el ID
    if (!id) {
      throw new Error('Se requiere un ID para actualizar una unidad');
    }
    
    // Format precio_venta if it's a string with currency formatting
    if (typeof unidadData.precio_venta === 'string') {
      if (unidadData.precio_venta.includes('$') || unidadData.precio_venta.includes(',')) {
        unidadData.precio_venta = parseFloat(unidadData.precio_venta.replace(/[$,]/g, ''));
      } else if (unidadData.precio_venta === '') {
        unidadData.precio_venta = null;
      }
    }
    
    // Handle empty date values - must be null for the database, not empty string
    if (unidadData.fecha_venta === '') {
      unidadData.fecha_venta = null;
    }
    
    // Handle empty string IDs - must be null for the database
    if (unidadData.vendedor_id === '') {
      unidadData.vendedor_id = null;
    }
    
    if (unidadData.comprador_id === '') {
      unidadData.comprador_id = null;
    }
    
    // Asegurarse de que el campo estado esté incluido
    if (!unidadData.estado) {
      console.error('Estado no definido en la actualización!');
      unidadData.estado = 'disponible'; // Valor por defecto seguro
    }
    
    // Log the final data being sent to ensure it's correct
    console.log('Sanitized data for update:', { id, ...unidadData });
    
    // Use una transacción para asegurar la atomicidad de la operación
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
    if (!id) {
      throw new Error('Se requiere un ID para eliminar una unidad');
    }
    
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

    // Actualizar conteos después de crear múltiples unidades
    updatePrototipoUnitCounts(prototipo_id, queryClient);

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
      if (variables.prototipo_id) {
        // Invalidar y provocar refresco para asegurar que los datos se actualicen
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', variables.prototipo_id]
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
        // Invalidar y provocar refresco para asegurar que los datos se actualicen
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', prototipoId]
        });
        
        // Actualizar conteos 
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
    onSuccess: (data) => {
      console.log('Mutation success with data:', data);
      if (prototipoId) {
        // Invalidar y provocar refresco para asegurar que los datos se actualicen
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', prototipoId]
        });
        
        // Actualizar conteos
        updatePrototipoUnitCounts(prototipoId, queryClient);
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
        // Invalidar y provocar refresco para asegurar que los datos se actualicen
        queryClient.invalidateQueries({ 
          queryKey: ['unidades', prototipoId]
        });
        
        // Actualizar conteos
        updatePrototipoUnitCounts(prototipoId, queryClient);
      }
    },
    onError: (error) => {
      console.error('Error in useDeleteUnidad mutation:', error);
    }
  });
};
