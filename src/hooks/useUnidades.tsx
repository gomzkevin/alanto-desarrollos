
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseUnidadesParams, UnidadCount, Unidad } from './unidades/types';
import { 
  countUnidadesByStatus,
  countDesarrolloUnidadesByStatus 
} from './unidades/countUtils';
import {
  useCreateUnidad,
  useUpdateUnidad,
  useDeleteUnidad,
  useCreateMultipleUnidades
} from './unidades/unidadCrud';

/**
 * Simplified hook for unidades management with stable rendering
 */
export const useUnidades = (params?: UseUnidadesParams) => {
  const prototipoId = params?.prototipo_id;
  const queryClient = useQueryClient();

  // Stable fetch function that doesn't change on rerenders
  const fetchUnidades = useCallback(async (): Promise<Unidad[]> => {
    if (!prototipoId) return [];
    
    console.log(`Fetching unidades for prototipo ${prototipoId}`);
    
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

    console.log(`Successfully fetched ${data?.length || 0} unidades`);
    return data as Unidad[] || [];
  }, [prototipoId]);

  // Use React Query with extremely stable configuration to prevent rerenders
  const { 
    data: unidades = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unidades', prototipoId],
    queryFn: fetchUnidades,
    enabled: !!prototipoId,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes (reduced from 10)
    refetchOnWindowFocus: false, 
    gcTime: 10 * 60 * 1000, // Keep inactive data for 10 minutes (reduced from 15)
  });

  // CRUD operations hooks with stable references
  const createMutation = useCreateUnidad(prototipoId);
  const updateMutation = useUpdateUnidad(prototipoId);
  const deleteMutation = useDeleteUnidad(prototipoId);
  const createMultipleUnidades = useCreateMultipleUnidades();

  // Función mejorada para invalidar cache y forzar refetch
  const forceRefetchUnidades = useCallback(() => {
    if (prototipoId) {
      // Invalidar la consulta
      queryClient.invalidateQueries({ 
        queryKey: ['unidades', prototipoId],
        exact: true
      });
      
      // Forzar una recarga inmediata
      return refetch();
    }
    return Promise.resolve({ data: unidades });
  }, [prototipoId, queryClient, refetch, unidades]);

  return {
    unidades,
    isLoading,
    error,
    createUnidad: createMutation.mutate,
    updateUnidad: updateMutation.mutate,
    deleteUnidad: deleteMutation.mutate,
    createMultipleUnidades,
    refetch: forceRefetchUnidades,
    countUnidadesByStatus,
    countDesarrolloUnidadesByStatus
  };
};

export default useUnidades;
