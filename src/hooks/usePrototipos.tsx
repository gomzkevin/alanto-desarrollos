
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useSubscriptionInfo } from './useSubscriptionInfo';
import { toast } from '@/components/ui/use-toast';

export type Prototipo = Tables<"prototipos">;

// Define extended type without circular references
export type ExtendedPrototipo = Prototipo & {
  desarrollo?: Tables<"desarrollos"> | null;
};

type FetchPrototiposOptions = {
  limit?: number;
  desarrolloId?: string | null;
  withDesarrollo?: boolean;
};

export const usePrototipos = (options: FetchPrototiposOptions = {}) => {
  const { limit, desarrolloId, withDesarrollo = false } = options;
  const { subscriptionInfo } = useSubscriptionInfo();
  
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

  // Check if can add more prototipos based on subscription limits
  const canAddPrototipo = () => {
    if (!subscriptionInfo.isActive) {
      toast({
        title: "Suscripción requerida",
        description: "Necesitas una suscripción activa para crear prototipos.",
        variant: "destructive",
      });
      return false;
    }

    if (subscriptionInfo.resourceType !== 'prototipo' && subscriptionInfo.resourceType !== null) {
      toast({
        title: "Plan incompatible",
        description: "Tu plan actual no permite la creación de prototipos. Considera cambiar a un plan por prototipo.",
        variant: "destructive",
      });
      return false;
    }

    if (subscriptionInfo.resourceLimit !== null && subscriptionInfo.resourceCount >= subscriptionInfo.resourceLimit) {
      toast({
        title: "Límite alcanzado",
        description: `Has alcanzado el límite de ${subscriptionInfo.resourceLimit} prototipos de tu plan. Contacta a soporte para aumentar tu límite.`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Calculate billing amount for prototipos
  const calculateBillingAmount = () => {
    if (!subscriptionInfo.isActive || subscriptionInfo.resourceType !== 'prototipo') {
      return 0;
    }
    
    return queryResult.data?.length || 0 * (subscriptionInfo.currentPlan?.features.precio_por_unidad || 0);
  };

  return {
    prototipos: queryResult.data || [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
    canAddPrototipo,
    calculateBillingAmount
  };
};

export default usePrototipos;
