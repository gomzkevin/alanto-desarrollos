
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Desarrollo = Tables<"desarrollos">;

type FetchDesarrollosOptions = {
  limit?: number;
  withPrototipos?: boolean;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { limit, withPrototipos = false } = options;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async () => {
    console.log('Fetching desarrollos with options:', options);
    
    try {
      // Build the select query
      let query = supabase
        .from('desarrollos')
        .select(withPrototipos ? '*, prototipos(*)' : '*');
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Order by nombre
      query = query.order('nombre');
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching desarrollos:', error);
        throw new Error(error.message);
      }
      
      console.log('Desarrollos fetched:', data);
      return data as Desarrollo[];
    } catch (error) {
      console.error('Error in fetchDesarrollos:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['desarrollos', limit, withPrototipos],
    queryFn: fetchDesarrollos
  });

  return {
    desarrollos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

export default useDesarrollos;
