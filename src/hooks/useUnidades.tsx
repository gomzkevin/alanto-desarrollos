
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
 * Simplified hook for unidades management
 */
export const useUnidades = (params?: UseUnidadesParams) => {
  const prototipoId = params?.prototipo_id;
  const queryClient = useQueryClient();

  // Simplified function to fetch all unidades for a specific prototipo
  const fetchUnidades = async (): Promise<Unidad[]> => {
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

    return data as Unidad[] || [];
  };

  // CRUD operations hooks
  const createMutation = useCreateUnidad(prototipoId);
  const updateMutation = useUpdateUnidad(prototipoId);
  const deleteMutation = useDeleteUnidad(prototipoId);
  const createMultipleUnidades = useCreateMultipleUnidades();

  // Use React Query with stable configuration to prevent excessive rerenders
  const { 
    data: unidades = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unidades', prototipoId],
    queryFn: fetchUnidades,
    enabled: !!prototipoId,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes to prevent frequent refetches
    refetchOnWindowFocus: false, // Don't refetch on window focus
    gcTime: 10 * 60 * 1000, // Keep inactive data for 10 minutes
    refetchInterval: false, // Disable automatic refetching
    retry: false // Don't retry on error
  });

  // Function to invalidate unidades cache (but do not trigger immediate refetch)
  const invalidateUnidades = () => {
    if (prototipoId) {
      queryClient.invalidateQueries({ 
        queryKey: ['unidades', prototipoId],
        refetchType: 'none' // Important: don't trigger immediate refetch
      });
    }
  };

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
