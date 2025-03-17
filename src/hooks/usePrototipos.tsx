
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

export type Prototipo = Tables<"prototipos">;

// Define extended type without circular references
export type ExtendedPrototipo = Prototipo & {
  desarrollo?: Tables<"desarrollos"> | null;
};

type FetchPrototiposOptions = {
  limit?: number;
  desarrolloId?: string | null;
  withDesarrollo?: boolean;
  staleTime?: number;
  onError?: (error: Error) => void;
};

export const usePrototipos = (options: FetchPrototiposOptions = {}) => {
  const { limit, desarrolloId, withDesarrollo = false, staleTime = 60000, onError } = options;
  const { toast } = useToast();
  
  // Function to fetch prototipos with better error handling
  const fetchPrototipos = async (): Promise<ExtendedPrototipo[]> => {
    console.log('Fetching prototipos with options:', options);
    
    try {
      // Build the basic query
      let query = supabase.from('prototipos').select('*');
      
      // Filter by desarrollo_id if provided
      if (desarrolloId) {
        query = query.eq('desarrollo_id', desarrolloId);
      }
      
      // Apply limit if provided
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data: prototipos, error } = await query;
      
      if (error) {
        console.error('Error fetching prototipos:', error);
        throw new Error(`Error al cargar prototipos: ${error.message}`);
      }
      
      // If withDesarrollo is requested, fetch the desarrollo for each prototipo
      if (withDesarrollo && prototipos && prototipos.length > 0) {
        // Get all unique desarrollo_ids
        const desarrolloIds = [...new Set(prototipos.map(p => p.desarrollo_id))].filter(Boolean);
        
        if (desarrolloIds.length === 0) {
          return prototipos as ExtendedPrototipo[];
        }
        
        // Fetch all desarrollos in one query
        const { data: desarrollos, error: desarrollosError } = await supabase
          .from('desarrollos')
          .select('*')
          .in('id', desarrolloIds);
          
        if (desarrollosError) {
          console.error('Error fetching desarrollos:', desarrollosError);
          // Continue with null desarrollos
          return prototipos as ExtendedPrototipo[];
        }
        
        // Map desarrollos to prototipos
        const extendedPrototipos: ExtendedPrototipo[] = prototipos.map(prototipo => {
          const desarrollo = desarrollos?.find(d => d.id === prototipo.desarrollo_id) || null;
          return {
            ...prototipo,
            desarrollo
          };
        });
        
        return extendedPrototipos;
      }
      
      return prototipos as ExtendedPrototipo[];
    } catch (error) {
      console.error('Error in fetchPrototipos:', error);
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    }
  };

  // Use React Query to fetch and cache the data with improved settings
  const queryResult = useQuery({
    queryKey: ['prototipos', limit, desarrolloId, withDesarrollo],
    queryFn: fetchPrototipos,
    staleTime: staleTime,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    meta: {
      onError: (error: Error) => {
        console.error('Error in prototipos query:', error);
        if (onError) {
          onError(error);
        } else {
          toast({
            title: 'Error',
            description: `No se pudieron cargar los prototipos: ${error.message}`,
            variant: 'destructive',
          });
        }
      }
    }
  });

  return {
    prototipos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

export default usePrototipos;
