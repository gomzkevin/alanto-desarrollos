
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Prototipo = Tables<"prototipos">;

// Define extended type without circular references
export type ExtendedPrototipo = Prototipo & {
  desarrollo?: Tables<"desarrollos"> | null;
  unidades_vendidas?: number;
  unidades_con_anticipo?: number;
};

type FetchPrototiposOptions = {
  limit?: number;
  desarrolloId?: string | null;
  withDesarrollo?: boolean;
};

export const usePrototipos = (options: FetchPrototiposOptions = {}) => {
  const { limit, desarrolloId, withDesarrollo = false } = options;
  
  // Function to fetch prototipos
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
        throw new Error(error.message);
      }
      
      // If withDesarrollo is requested, fetch the desarrollo for each prototipo
      if (withDesarrollo && prototipos && prototipos.length > 0) {
        // Get all unique desarrollo_ids
        const desarrolloIds = [...new Set(prototipos.map(p => p.desarrollo_id))];
        
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
          const desarrollo = desarrollos.find(d => d.id === prototipo.desarrollo_id) || null;
          return {
            ...prototipo,
            desarrollo
          };
        });
        
        console.log('Extended prototipos fetched:', extendedPrototipos);
        return extendedPrototipos;
      }
      
      console.log('Prototipos fetched:', prototipos);
      return prototipos as ExtendedPrototipo[];
    } catch (error) {
      console.error('Error in fetchPrototipos:', error);
      throw error;
    }
  };

  // Use React Query to fetch and cache the data
  const queryResult = useQuery({
    queryKey: ['prototipos', limit, desarrolloId, withDesarrollo],
    queryFn: fetchPrototipos
  });

  return {
    prototipos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch
  };
};

export default usePrototipos;
