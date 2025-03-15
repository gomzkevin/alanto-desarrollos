
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';

export type Desarrollo = Tables<"desarrollos"> & {
  amenidades?: string[] | null;
};

// Define extended type with prototipos relation
export type ExtendedDesarrollo = Desarrollo & {
  prototipos?: Tables<"prototipos">[] | null;
};

type FetchDesarrollosOptions = {
  limit?: number;
  withPrototipos?: boolean;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { limit, withPrototipos = false } = options;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async (): Promise<ExtendedDesarrollo[]> => {
    console.log('Fetching desarrollos with options:', options);
    
    try {
      // Build the select query
      let query = supabase.from('desarrollos').select('*');
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      // Order by nombre
      query = query.order('nombre');
      
      const { data: desarrollos, error } = await query;
      
      if (error) {
        console.error('Error fetching desarrollos:', error);
        throw new Error(error.message);
      }
      
      // Process desarrollos to handle JSON amenidades
      const processedDesarrollos = desarrollos.map(desarrollo => {
        // Parse amenidades from JSON to string array if it exists
        const processedDesarrollo: ExtendedDesarrollo = {
          ...desarrollo,
          amenidades: desarrollo.amenidades 
            ? (Array.isArray(desarrollo.amenidades) 
                ? desarrollo.amenidades 
                : typeof desarrollo.amenidades === 'string' 
                  ? JSON.parse(desarrollo.amenidades)
                  : desarrollo.amenidades as string[])
            : null
        };
        return processedDesarrollo;
      });
      
      // If relations are requested, fetch them for each desarrollo
      if (withPrototipos && processedDesarrollos && processedDesarrollos.length > 0) {
        const extendedDesarrollos: ExtendedDesarrollo[] = await Promise.all(
          processedDesarrollos.map(async (desarrollo) => {
            const { data: prototipos, error: prototiposError } = await supabase
              .from('prototipos')
              .select('*')
              .eq('desarrollo_id', desarrollo.id);
            
            return {
              ...desarrollo,
              prototipos: prototiposError ? null : prototipos
            };
          })
        );
        
        console.log('Extended desarrollos fetched:', extendedDesarrollos);
        return extendedDesarrollos;
      }
      
      console.log('Desarrollos fetched:', processedDesarrollos);
      return processedDesarrollos;
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
