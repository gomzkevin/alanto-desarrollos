
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

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
  const { limit, withPrototipos = false, empresaId = null } = options;
  
  // Function to fetch desarrollos
  const fetchDesarrollos = async (): Promise<ExtendedDesarrollo[]> => {
    console.log('Fetching desarrollos with options:', options);
    
    try {
      // Build the select query
      let query = supabase.from('desarrollos').select('*');
      
      // Filter by empresa_id if provided
      if (empresaId) {
        // Filter desarrollos by empresa_id instead of user_id
        query = query.eq('empresa_id', empresaId);
        console.log(`Filtering desarrollos by empresa_id: ${empresaId}`);
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
    queryKey: ['desarrollos', limit, withPrototipos, empresaId],
    queryFn: fetchDesarrollos,
    // Only enable when empresaId is available or we're not filtering by empresaId
    enabled: empresaId !== null || options.empresaId === undefined,
    staleTime: 0 // Force a fresh fetch on each component mount
  });

  // Check if can add more desarrollos based on subscription limits
  const canAddDesarrollo = async () => {
    try {
      // Fetch subscription data directly instead of using the hook
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!subscription) {
        toast({
          title: "Suscripción requerida",
          description: "Necesitas una suscripción activa para crear desarrollos.",
          variant: "destructive",
        });
        return false;
      }
      
      const planFeatures = subscription.subscription_plans.features || {};
      const resourceType = planFeatures.tipo;
      const resourceLimit = planFeatures.max_recursos;
      
      if (resourceType !== 'desarrollo' && resourceType !== undefined) {
        toast({
          title: "Plan incompatible",
          description: "Tu plan actual no permite la creación de desarrollos. Considera cambiar a un plan por desarrollo.",
          variant: "destructive",
        });
        return false;
      }
      
      if (resourceLimit !== undefined && queryResult.data && queryResult.data.length >= resourceLimit) {
        toast({
          title: "Límite alcanzado",
          description: `Has alcanzado el límite de ${resourceLimit} desarrollos de tu plan. Contacta a soporte para aumentar tu límite.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return false;
    }
  };

  // Calculate billing amount for desarrollos
  const calculateBillingAmount = async () => {
    try {
      // Fetch subscription data directly
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return 0;
      
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userData.user.id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (!subscription) return 0;
      
      const planFeatures = subscription.subscription_plans.features || {};
      const resourceType = planFeatures.tipo;
      const precioUnidad = planFeatures.precio_por_unidad || 0;
      
      if (resourceType !== 'desarrollo') return 0;
      
      return (queryResult.data?.length || 0) * precioUnidad;
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
    empresaId, // Expose empresaId for reference
    isFetched: queryResult.isFetched,
    canAddDesarrollo,
    calculateBillingAmount
  };
};

export default useDesarrollos;
