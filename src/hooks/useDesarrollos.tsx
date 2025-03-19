
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
  userId?: string | null; // Option to filter by user ID
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { limit, withPrototipos = false, userId = null } = options;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async (): Promise<ExtendedDesarrollo[]> => {
    console.log('Fetching desarrollos with options:', options);
    
    try {
      // Build the select query
      let query = supabase.from('desarrollos').select('*');
      
      // Filter by user ID if provided
      if (userId) {
        // Convert userId to string in a type-safe way
        const userIdString = String(userId);
        query = query.eq('user_id', userIdString);
      }
      
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
        let amenidades: string[] | null = null;
        
        // Check if amenidades exists and handle different possible formats
        if (desarrollo.amenidades) {
          if (Array.isArray(desarrollo.amenidades)) {
            // If it's already an array, convert all items to strings
            amenidades = desarrollo.amenidades.map(item => String(item));
          } else if (typeof desarrollo.amenidades === 'string') {
            // If it's a JSON string, parse it
            try {
              const parsed = JSON.parse(desarrollo.amenidades);
              if (Array.isArray(parsed)) {
                amenidades = parsed.map(item => String(item));
              }
            } catch (e) {
              // If parsing fails, use the string as a single item array
              amenidades = [desarrollo.amenidades];
            }
          } else {
            // Handle object case by converting to array of strings
            const jsonObj = desarrollo.amenidades as Json;
            
            // For objects we'll extract their values as strings, if they have an id property
            if (typeof jsonObj === 'object' && jsonObj !== null) {
              if (Array.isArray(jsonObj)) {
                amenidades = jsonObj.map(item => String(item));
              } else {
                // Just use the keys if it's a regular object
                amenidades = Object.values(jsonObj).map(val => String(val));
              }
            }
          }
        }
        
        const processedDesarrollo: ExtendedDesarrollo = {
          ...desarrollo,
          amenidades
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
    queryKey: ['desarrollos', limit, withPrototipos, userId],
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
