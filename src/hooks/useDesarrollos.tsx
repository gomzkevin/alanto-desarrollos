
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useResourceCounts } from './useResourceCounts';

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
  empresaId?: number | null;
};

export const useDesarrollos = (options: FetchDesarrollosOptions = {}) => {
  const { limit, withPrototipos = false, empresaId: optionsEmpresaId = null } = options;
  const { empresaId: userEmpresaId } = useUserRole();
  const { canAddResource } = useResourceCounts();
  
  const effectiveEmpresaId = optionsEmpresaId || userEmpresaId;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async (): Promise<ExtendedDesarrollo[]> => {
    console.log('Fetching desarrollos with options:', { ...options, effectiveEmpresaId });
    
    try {
      // Build the select query
      let query = supabase.from('desarrollos').select('*');
      
      // Filter by empresa_id if provided
      if (effectiveEmpresaId) {
        // Filter desarrollos by empresa_id instead of user_id
        query = query.eq('empresa_id', effectiveEmpresaId);
        console.log(`Filtering desarrollos by empresa_id: ${effectiveEmpresaId}`);
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
    queryKey: ['desarrollos', limit, withPrototipos, effectiveEmpresaId],
    queryFn: fetchDesarrollos,
    // Only enable when empresaId is available or we're not filtering by empresaId
    enabled: effectiveEmpresaId !== null || options.empresaId === undefined,
    staleTime: 2 * 60 * 1000 // 2 minutes cache
  });

  // Check if can add more desarrollos based on subscription limits - now using our optimized function
  const canAddDesarrollo = async () => {
    return await canAddResource('desarrollo');
  };

  // Calculate billing amount based on resource counts
  const calculateBillingAmount = async () => {
    try {
      if (!effectiveEmpresaId) {
        return 0;
      }
      
      // Get subscription info via our new RPC function
      const { data, error } = await supabase.rpc('get_subscription_status', { 
        company_id: effectiveEmpresaId 
      });
      
      if (error) {
        console.error("Error getting subscription status:", error);
        return 0;
      }
      
      if (!data) {
        return 0;
      }
      
      // Data is a JSONB object, we need to properly type it
      const subscriptionData = data as {
        isActive: boolean;
        currentPlan: {
          id: string;
          name: string;
          price: number;
          interval: string;
          features: {
            tipo?: string;
            precio_por_unidad?: number;
          };
        } | null;
        resourceType: string | null;
        resourceCount: number;
      };
      
      if (!subscriptionData.currentPlan || !subscriptionData.currentPlan.features) {
        return 0;
      }
      
      const resourceType = subscriptionData.resourceType;
      const precioUnidad = subscriptionData.currentPlan.features.precio_por_unidad || 0;
      
      if (resourceType !== 'desarrollo') {
        return 0;
      }
      
      return subscriptionData.resourceCount * precioUnidad;
    } catch (error) {
      console.error("Error calculating billing:", error);
      return 0;
    }
  };

  return {
    desarrollos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    empresaId: effectiveEmpresaId, // Expose empresaId for reference
    isFetched: queryResult.isFetched,
    canAddDesarrollo,
    calculateBillingAmount
  };
};

export default useDesarrollos;
