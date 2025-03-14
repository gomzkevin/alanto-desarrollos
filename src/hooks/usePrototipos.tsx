
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Prototipo = Tables<"prototipos">;

type FetchPrototiposOptions = {
  desarrolloId?: string;
  limit?: number;
  filters?: Record<string, any>;
};

export const usePrototipos = (options: FetchPrototiposOptions = {}) => {
  const { desarrolloId, limit, filters = {} } = options;
  
  // Function to fetch prototipos
  const fetchPrototipos = async () => {
    console.log('Fetching prototipos with options:', options);
    
    let query = supabase
      .from('prototipos')
      .select('*');
      
    // Filter by desarrollo_id if provided
    if (desarrolloId) {
      query = query.eq('desarrollo_id', desarrolloId);
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(limit);
    }
    
    // Apply filters if any
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching prototipos:', error);
      throw new Error(error.message);
    }
    
    console.log('Prototipos fetched:', data);
    return data || [];
  };

  // Use React Query to fetch and cache the data
  const { 
    data: prototipos, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['prototipos', desarrolloId, limit, JSON.stringify(filters)],
    queryFn: fetchPrototipos,
    enabled: desarrolloId !== undefined || Object.keys(filters).length > 0
  });

  return {
    prototipos: prototipos || [],
    isLoading,
    error,
    refetch
  };
};

export default usePrototipos;
