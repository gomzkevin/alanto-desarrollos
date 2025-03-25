
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
    max_desarrollos?: number;
    max_prototipos?: number;
    max_vendedores?: number;
  };
}

export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan | null;
  isActive: boolean;
  renewalDate: Date | null;
  desarrolloCount: number;
  desarrolloLimit: number | null;
  prototipoCount: number | null;
  prototipoLimit: number | null;
  totalResourceCount: number;
  totalResourceLimit: number | null;
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
  desarrolloCount: 0,
  desarrolloLimit: null,
  prototipoCount: 0,
  prototipoLimit: null,
  totalResourceCount: 0,
  totalResourceLimit: null,
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

      console.log('Fetching subscription info for userId:', userId, 'empresaId:', empresaId);

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
        console.log('No active subscription found');
        return getDefaultSubscriptionInfo();
      }

      console.log('Subscription data:', subscription);

      // Extract plan features safely
      const planFeatures = subscription.subscription_plans.features || {};
      let features = {
        max_desarrollos: undefined as number | undefined,
        max_prototipos: undefined as number | undefined,
        max_vendedores: undefined as number | undefined
      };
      
      // Check if features is an object (not array) and assign properties safely
      if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
        const featuresObj = planFeatures as { [key: string]: Json };
        
        features = {
          max_desarrollos: typeof featuresObj.max_desarrollos === 'number' ? featuresObj.max_desarrollos : undefined,
          max_prototipos: typeof featuresObj.max_prototipos === 'number' ? featuresObj.max_prototipos : undefined,
          max_vendedores: typeof featuresObj.max_vendedores === 'number' ? featuresObj.max_vendedores : undefined
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

      console.log('Extracted plan:', plan);
      
      // Get desarrollos count
      let desarrolloCount = 0;
      let prototipoCount = 0;
      
      try {
        if (empresaId) {
          // Count desarrollos
          const { count: desarrollos, error: desarrolloError } = await supabase
            .from('desarrollos')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
              
          if (desarrolloError) {
            console.error('Error counting desarrollos:', desarrolloError);
          } else if (desarrollos !== null) {
            desarrolloCount = desarrollos;
            console.log(`Found ${desarrollos} desarrollos for empresa_id ${empresaId}`);
          }
          
          // Count prototipos
          const { data: desarrolloIds, error: idsError } = await supabase
            .from('desarrollos')
            .select('id')
            .eq('empresa_id', empresaId);
          
          if (idsError) {
            console.error('Error getting desarrollo IDs:', idsError);
          } else if (desarrolloIds && desarrolloIds.length > 0) {
            const ids = desarrolloIds.map(d => d.id);
            
            const { count: prototipos, error: prototipError } = await supabase
              .from('prototipos')
              .select('*', { count: 'exact', head: true })
              .in('desarrollo_id', ids);
              
            if (prototipError) {
              console.error('Error counting prototipos:', prototipError);
            } else if (prototipos !== null) {
              prototipoCount = prototipos;
              console.log(`Found ${prototipos} prototipos for all desarrollos`);
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
      
      // Extract resource limits from plan features
      const desarrolloLimit = plan.features.max_desarrollos || null;
      const prototipoLimit = plan.features.max_prototipos || null;
      const vendorLimit = plan.features.max_vendedores || null;
      
      // Total resource count and limit
      const totalResourceCount = desarrolloCount + prototipoCount;
      const totalResourceLimit = desarrolloLimit && prototipoLimit 
        ? desarrolloLimit + prototipoLimit 
        : null;
      
      // Get renewal date
      const renewalDate = subscription.current_period_end 
        ? new Date(subscription.current_period_end)
        : null;
      
      // Calculate limits percentages
      const isOverLimit = 
        (desarrolloLimit !== null && desarrolloCount > desarrolloLimit) ||
        (prototipoLimit !== null && prototipoCount > prototipoLimit);
      
      const percentUsed = totalResourceLimit 
        ? Math.min(100, (totalResourceCount / totalResourceLimit) * 100) 
        : 0;
        
      const isOverVendorLimit = vendorLimit !== null && vendorCount > vendorLimit;
      
      console.log('Final subscription info:', {
        desarrolloCount,
        desarrolloLimit,
        prototipoCount,
        prototipoLimit,
        vendorCount,
        vendorLimit
      });

      return {
        currentPlan: plan,
        isActive: subscription.status === 'active',
        renewalDate,
        desarrolloCount,
        desarrolloLimit,
        prototipoCount,
        prototipoLimit,
        totalResourceCount,
        totalResourceLimit,
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
