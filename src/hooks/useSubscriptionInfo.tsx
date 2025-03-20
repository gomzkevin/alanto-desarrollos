
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Query to fetch the active subscription and plan details
  const { data: subscriptionInfo, isLoading, error } = useQuery({
    queryKey: ['subscriptionInfo', userId, empresaId],
    queryFn: async (): Promise<SubscriptionInfo> => {
      if (!userId) {
        return getDefaultSubscriptionInfo();
      }

      // Get the active subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        throw subError;
      }

      if (!subscription) {
        return getDefaultSubscriptionInfo();
      }

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
        features = {
          tipo: planFeatures.tipo as 'desarrollo' | 'prototipo' | undefined,
          precio_por_unidad: planFeatures.precio_por_unidad as number | undefined,
          max_vendedores: planFeatures.max_vendedores as number | undefined,
          max_recursos: planFeatures.max_recursos as number | undefined
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
      
      // Instead of directly using the hooks, fetch resource counts directly
      let resourceCount = 0;
      if (resourceType === 'desarrollo' && empresaId) {
        const { count, error } = await supabase
          .from('desarrollos')
          .select('count')
          .eq('empresa_id', empresaId);
          
        if (!error && count) {
          resourceCount = parseInt(count as unknown as string);
        }
      } else if (resourceType === 'prototipo') {
        const { count, error } = await supabase
          .from('prototipos')
          .select('count');
          
        if (!error && count) {
          resourceCount = parseInt(count as unknown as string);
        }
      }
      
      // Get vendor count for the company
      const { data: vendors, error: vendorError } = await supabase
        .from('usuarios')
        .select('count')
        .eq('empresa_id', empresaId)
        .eq('rol', 'vendedor');
        
      if (vendorError) {
        console.error('Error counting vendors:', vendorError);
      }
      
      const vendorCount = vendors ? parseInt(vendors[0]?.count as unknown as string || '0') : 0;
      
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
    },
    enabled: !!userId,
  });

  return {
    subscriptionInfo: subscriptionInfo || getDefaultSubscriptionInfo(),
    isLoading,
    error
  };
};

export default useSubscriptionInfo;
