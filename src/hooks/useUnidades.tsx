
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
  };

  // CRUD operations hooks
  const createMutation = useCreateUnidad(prototipoId);
  const updateMutation = useUpdateUnidad(prototipoId);
  const deleteMutation = useDeleteUnidad(prototipoId);
  const createMultipleUnidades = useCreateMultipleUnidades();

  // Use React Query to fetch unidades with a shorter stale time to refresh more frequently
  const { 
    data: unidades = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['unidades', prototipoId],
    queryFn: fetchUnidades,
    enabled: !!prototipoId,
    staleTime: 1000, // Consider data stale after 1 second
    refetchOnWindowFocus: true,
    refetchInterval: 3000  // Auto-refresh every 3 seconds
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
