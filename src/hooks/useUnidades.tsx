
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
    staleTime: 10 * 60 * 1000, // Cache data for 10 minutes to prevent frequent refetches
    refetchOnWindowFocus: false, 
    gcTime: 15 * 60 * 1000, // Keep inactive data for 15 minutes
    refetchInterval: false,
    retry: false
  });

  // CRUD operations hooks with stable references
  const createMutation = useCreateUnidad(prototipoId);
  const updateMutation = useUpdateUnidad(prototipoId);
  const deleteMutation = useDeleteUnidad(prototipoId);
  const createMultipleUnidades = useCreateMultipleUnidades();

  // Function to invalidate unidades cache (but do not trigger immediate refetch)
  const invalidateUnidades = useCallback(() => {
    if (prototipoId) {
      queryClient.invalidateQueries({ 
        queryKey: ['unidades', prototipoId],
        refetchType: 'none' // Important: don't trigger immediate refetch
      });
    }
  }, [prototipoId, queryClient]);

  return {
    unidades,
    isLoading,
    error,
    createUnidad: createMutation.mutate,
    updateUnidad: updateMutation.mutate,
    deleteUnidad: deleteMutation.mutate,
    createMultipleUnidades,
    refetch,
    invalidateUnidades,
    countUnidadesByStatus,
    countDesarrolloUnidadesByStatus
  };
};

export default useUnidades;
