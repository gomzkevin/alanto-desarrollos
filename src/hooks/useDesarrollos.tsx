
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';

export type Desarrollo = Tables<"desarrollos"> & {
  amenidades?: string[] | null;
  user_id?: string | null; // Added user_id field to match database
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
    console.log('Fetching desarrollos with options:', { 
      limit, 
      withPrototipos, 
      userId,
      hasUserId: !!userId 
    });
    
    try {
      // Don't proceed if userId is required but not available yet
      if (userId === null || userId === undefined) {
        console.log('userId is null or undefined, returning empty array');
        return [];
      }
      
      // Build the select query
      let query = supabase.from('desarrollos').select('*');
      
      // Filter by user ID if provided
      if (userId) {
        // Use string literals for column and operator
        query = query.filter('user_id', 'eq', userId);
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
      
      console.log(`Found ${desarrollos?.length || 0} desarrollos for user ${userId}`);
      
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
        
        console.log('Extended desarrollos fetched:', extendedDesarrollos.length);
        return extendedDesarrollos;
      }
      
      console.log('Desarrollos fetched:', processedDesarrollos.length);
      return processedDesarrollos;
    } catch (error) {
      console.error('Error in fetchDesarrollos:', error);
      throw error;
    }
  };

  // Enhanced query configuration
  const queryResult = useQuery({
    queryKey: ['desarrollos', limit, withPrototipos, userId],
    queryFn: fetchDesarrollos,
    enabled: userId !== null && userId !== undefined, // Only enable query when userId is available
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1, // Limit retries to avoid excessive calls
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  return {
    desarrollos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
    refetch: queryResult.refetch,
    status: queryResult.status,
    isSuccess: queryResult.isSuccess,
    isEnabled: userId !== null && userId !== undefined
  };
};

export default useDesarrollos;
