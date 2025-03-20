
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import useDesarrollos from './useDesarrollos';
import usePrototipos from './usePrototipos';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: {
    tipo?: 'desarrollo' | 'prototipo';
    precio_por_unidad?: number;
    max_vendedores?: number;
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

export const useSubscriptionInfo = () => {
  const { userId, empresaId } = useUserRole();
  const { desarrollos } = useDesarrollos({ empresaId });
  const { prototipos } = usePrototipos({ withDesarrollo: true });

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

      // Extract plan details
      const plan: SubscriptionPlan = {
        id: subscription.subscription_plans.id,
        name: subscription.subscription_plans.name,
        price: subscription.subscription_plans.price,
        interval: subscription.subscription_plans.interval as 'month' | 'year',
        features: subscription.subscription_plans.features || {}
      };

      // Get resource type and count from the plan
      const resourceType = plan.features.tipo || null;
      
      // Count resources based on plan type
      let resourceCount = 0;
      if (resourceType === 'desarrollo') {
        resourceCount = desarrollos.length;
      } else if (resourceType === 'prototipo') {
        resourceCount = prototipos.length;
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

  return {
    subscriptionInfo: subscriptionInfo || getDefaultSubscriptionInfo(),
    isLoading,
    error
  };
};

export default useSubscriptionInfo;
