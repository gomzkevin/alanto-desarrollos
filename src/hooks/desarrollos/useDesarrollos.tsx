
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '../useUserRole';
import { fetchDesarrollos } from './desarrolloFetcher';
import { FetchDesarrollosOptions, DesarrolloExtended } from './types';

/**
 * Hook to fetch and manage desarrollos data
 */
export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { withStats = true, staleTime = 60000, limit } = options;
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();

  const queryResult = useQuery({
    queryKey: ['desarrollos', empresaId, withStats, limit],
    queryFn: () => fetchDesarrollos(empresaId, withStats, limit),
    enabled: !!empresaId && !isUserRoleLoading,
    staleTime: staleTime,
    refetchOnWindowFocus: false
  });

  // Return with desarrollos property for backward compatibility
  return {
    ...queryResult,
    desarrollos: queryResult.data || []
  };
};

export default useDesarrollos;
