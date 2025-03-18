
import { useQuery } from '@tanstack/react-query';
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
 * Main hook for unidades management
 */
export const useUnidades = (params?: UseUnidadesParams) => {
  const prototipoId = params?.prototipo_id;

  // Function to fetch all unidades for a specific prototipo
  const fetchUnidades = async (): Promise<Unidad[]> => {
    if (!prototipoId) return [];

    console.log(`Fetching unidades for prototipo: ${prototipoId}`);
    
    try {
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

      console.log(`Fetched ${data?.length || 0} unidades`);
      return data as Unidad[] || [];
    } catch (error) {
      console.error('Error en fetchUnidades:', error);
      throw error;
    }
  };

  // CRUD operations hooks
  const createMutation = useCreateUnidad(prototipoId);
  const updateMutation = useUpdateUnidad(prototipoId);
  const deleteMutation = useDeleteUnidad(prototipoId);
  const createMultipleUnidades = useCreateMultipleUnidades();

  // Use React Query to fetch unidades with optimized configuration
  const { 
    data: unidades = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unidades', prototipoId],
    queryFn: fetchUnidades,
    enabled: !!prototipoId,
    staleTime: 10000, // Consider data stale after 10 seconds (reduced frequency)
    refetchOnWindowFocus: true,
    refetchInterval: 30000,  // Less frequent auto-refresh (30 seconds)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
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
