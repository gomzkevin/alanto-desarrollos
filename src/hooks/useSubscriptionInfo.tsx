
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    tipo?: 'desarrollo' | 'prototipo';
    precio_por_unidad?: number;
    max_vendedores?: number;
    max_recursos?: number;
  };
}

export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan | null;
  isActive: boolean;
  renewalDate: Date | null;
  resourceCount: number;
  resourceLimit: number | null;
  resourceType: 'desarrollo' | 'prototipo' | null;
  currentBilling: number;
  isOverLimit: boolean;
  percentUsed: number;
  vendorCount: number;
  vendorLimit: number | null;
  isOverVendorLimit: boolean;
}

// Default empty subscription info
const getDefaultSubscriptionInfo = (): SubscriptionInfo => ({
  currentPlan: null,
  isActive: false,
  renewalDate: null,
  resourceCount: 0,
  resourceLimit: null,
  resourceType: null,
  currentBilling: 0,
  isOverLimit: false,
  percentUsed: 0,
  vendorCount: 0,
  vendorLimit: null,
  isOverVendorLimit: false
});

export const useSubscriptionInfo = () => {
  const { userId, empresaId } = useUserRole();
  
  // Query to fetch the active subscription for the user's empresa
  const { data: subscriptionInfo, isLoading, error } = useQuery({
    queryKey: ['subscriptionInfo', userId, empresaId],
    queryFn: async (): Promise<SubscriptionInfo> => {
      if (!userId || !empresaId) {
        console.log('No userId or empresaId, returning default subscription info');
        return getDefaultSubscriptionInfo();
      }

      console.log('Fetching subscription info for empresaId:', empresaId);

      // IMPORTANTE: Verificamos primero si hay una suscripción activa para la empresa
      const { data: empresaSubscription, error: empresaSubError } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('empresa_id', empresaId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (empresaSubError) {
        console.error('Error fetching empresa subscription:', empresaSubError);
        throw empresaSubError;
      }
      
      // Si encontramos una suscripción activa para la empresa, la usamos
      if (empresaSubscription) {
        console.log('Found active subscription for empresa:', empresaSubscription);
        return await processSubscription(empresaSubscription, empresaId);
      }
      
      // Si no hay suscripción de empresa, verificamos si el usuario tiene una suscripción personal
      const { data: userSubscription, error: userSubError } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (userSubError) {
        console.error('Error fetching user subscription:', userSubError);
        throw userSubError;
      }

      if (!userSubscription) {
        console.log('No active subscription found for user or empresa');
        return getDefaultSubscriptionInfo();
      }

      console.log('Found active subscription for user:', userSubscription);
      return await processSubscription(userSubscription, empresaId);
    },
    enabled: !!userId,
  });

  // Función auxiliar para procesar los datos de la suscripción
  const processSubscription = async (subscription: any, empresaId: number | null): Promise<SubscriptionInfo> => {
    // Extract plan features safely
    const planFeatures = subscription.subscription_plans.features || {};
    let features = {
      tipo: undefined as 'desarrollo' | 'prototipo' | undefined,
      precio_por_unidad: undefined as number | undefined,
      max_vendedores: undefined as number | undefined,
      max_recursos: undefined as number | undefined
    };
    
    // Check if features is an object (not array) and assign properties safely
    if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
      const featuresObj = planFeatures as { [key: string]: Json };
      
      features = {
        tipo: featuresObj.tipo as 'desarrollo' | 'prototipo' | undefined,
        precio_por_unidad: typeof featuresObj.precio_por_unidad === 'number' ? featuresObj.precio_por_unidad : undefined,
        max_vendedores: typeof featuresObj.max_vendedores === 'number' ? featuresObj.max_vendedores : undefined,
        max_recursos: typeof featuresObj.max_recursos === 'number' ? featuresObj.max_recursos : undefined
      };
    }
    
    // Extract plan details
    const plan: SubscriptionPlan = {
      id: subscription.subscription_plans.id,
      name: subscription.subscription_plans.name,
      price: subscription.subscription_plans.price,
      interval: subscription.subscription_plans.interval as 'month' | 'year',
      features: features
    };

    // Get resource type and count from the plan
    const resourceType = plan.features.tipo || null;
    console.log('Resource type:', resourceType);
    
    // Get resource counts - improved version with better error handling and more precise queries
    let resourceCount = 0;
    
    try {
      if (resourceType === 'desarrollo' && empresaId) {
        // For desarrollo plans, count desarrollos filtered by empresa_id
        const { count, error: countError } = await supabase
          .from('desarrollos')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId);
          
        if (countError) {
          console.error('Error counting desarrollos:', countError);
        } else if (count !== null) {
          resourceCount = count;
          console.log(`Found ${count} desarrollos for empresa_id ${empresaId}`);
        }
      } else if (resourceType === 'prototipo') {
        // For prototipo plans, count all prototipos associated with the empresa's desarrollos
        if (empresaId) {
          // First, get all desarrollo_ids for this empresa
          const { data: desarrollos, error: desarError } = await supabase
            .from('desarrollos')
            .select('id')
            .eq('empresa_id', empresaId);
            
          if (desarError) {
            console.error('Error getting empresa desarrollos:', desarError);
          } else if (desarrollos && desarrollos.length > 0) {
            // Get all desarrollo IDs
            const desarrolloIds = desarrollos.map(d => d.id);
            console.log('Desarrollo IDs for this empresa:', desarrolloIds);
            
            // Count prototipos associated with these desarrollos
            const { count: protoCount, error: protoError } = await supabase
              .from('prototipos')
              .select('*', { count: 'exact', head: true })
              .in('desarrollo_id', desarrolloIds);
              
            if (protoError) {
              console.error('Error counting prototipos:', protoError);
            } else if (protoCount !== null) {
              resourceCount = protoCount;
              console.log(`Found ${protoCount} prototipos for the empresa's desarrollos`);
            }
          } else {
            console.log('No desarrollos found for this empresa, so 0 prototipos');
          }
        }
      }
    } catch (countError) {
      console.error('Error in resource counting:', countError);
    }
    
    // Get vendor count for the company with improved error handling
    let vendorCount = 0;
    try {
      if (empresaId) {
        const { count: vendors, error: vendorError } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('rol', 'vendedor');
          
        if (vendorError) {
          console.error('Error counting vendors:', vendorError);
        } else if (vendors !== null) {
          vendorCount = vendors;
          console.log(`Found ${vendors} vendors for empresa_id ${empresaId}`);
        }
      }
    } catch (vendorCountError) {
      console.error('Error in vendor counting:', vendorCountError);
    }
    
    // Resource limit from plan features
    const resourceLimit = plan.features.max_recursos || null;
    const vendorLimit = plan.features.max_vendedores || null;
    
    // Calculate billing amount
    const precioUnidad = plan.features.precio_por_unidad || 0;
    const currentBilling = resourceCount * precioUnidad;
    
    // Get renewal date
    const renewalDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end)
      : null;
    
    // Calculate limits percentages
    const isOverLimit = resourceLimit !== null && resourceCount > resourceLimit;
    const percentUsed = resourceLimit ? Math.min(100, (resourceCount / resourceLimit) * 100) : 0;
    const isOverVendorLimit = vendorLimit !== null && vendorCount > vendorLimit;
    
    console.log('Final subscription info:', {
      resourceCount,
      resourceLimit,
      resourceType,
      vendorCount,
      vendorLimit,
      currentBilling
    });

    return {
      currentPlan: plan,
      isActive: subscription.status === 'active',
      renewalDate,
      resourceCount,
      resourceLimit,
      resourceType,
      currentBilling,
      isOverLimit,
      percentUsed,
      vendorCount,
      vendorLimit,
      isOverVendorLimit
    };
  };

  return {
    subscriptionInfo: subscriptionInfo || getDefaultSubscriptionInfo(),
    isLoading,
    error
  };
};

export default useSubscriptionInfo;
