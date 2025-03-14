
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;
type Prototipo = Tables<"prototipos">;

type FetchDesarrollosOptions = {
  withPrototipos?: boolean;
  limit?: number;
  filters?: Record<string, any>;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { withPrototipos = false, limit, filters = {} } = options;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async () => {
    console.log('Fetching desarrollos with options:', options);
    
    let query = supabase
      .from('desarrollos')
      .select(withPrototipos ? '*, prototipos(*)' : '*');
      
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
      console.error('Error fetching desarrollos:', error);
      throw new Error(error.message);
    }
    
    console.log('Desarrollos fetched:', data);
    return data as (withPrototipos extends true ? (Desarrollo & { prototipos: Prototipo[] })[] : Desarrollo[]);
  };

  // Use React Query to fetch and cache the data
  const { 
    data: desarrollos, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['desarrollos', withPrototipos, limit, JSON.stringify(filters)],
    queryFn: fetchDesarrollos
  });

  return {
    desarrollos: desarrollos || [],
    isLoading,
    error,
    refetch
  };
};

export default useDesarrollos;
