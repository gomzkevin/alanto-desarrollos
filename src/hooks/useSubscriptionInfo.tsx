
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { toast } from '@/components/ui/use-toast';

export interface SubscriptionInfo {
  isActive: boolean;
  currentPlan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: any;
  };
  renewalDate?: string;
  resourceType?: string;
  resourceLimit?: number;
  resourceCount?: number;
  vendorLimit?: number;
  vendorCount?: number;
  isOverLimit: boolean;
  isOverVendorLimit: boolean;
  desarrolloCount?: number;
  desarrolloLimit?: number;
  prototipoCount?: number;
  prototipoLimit?: number;
}

export const useSubscriptionInfo = () => {
  const { userId, empresaId } = useUserRole();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    isActive: false,
    isOverLimit: false,
    isOverVendorLimit: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.info(`Fetching subscription info for userId: ${userId} empresaId: ${empresaId}`);
        setIsLoading(true);
        setError(null);
        
        if (empresaId) {
          const { data: rawData, error: statusError } = await supabase
            .rpc('get_subscription_status', { company_id: empresaId });
            
          if (statusError) {
            console.error('Error fetching subscription status:', statusError);
            setError(statusError.message);
            setIsLoading(false);
            return;
          }
          
          if (rawData) {
            console.log('Subscription status data:', rawData);
            
            // Fetch desarrollos count
            const { data: desarrolloData, error: desarrolloError } = await supabase
              .from('desarrollos')
              .select('id')
              .eq('empresa_id', empresaId);
              
            if (desarrolloError) {
              console.error('Error counting desarrollos:', desarrolloError);
            }
            
            const desarrolloCount = desarrolloData?.length || 0;
            console.log('Desarrollos count:', desarrolloCount);
            
            // Fetch prototipos count by first getting all desarollos for the company,
            // then finding prototypes linked to those developments
            // This is a two-step process to ensure accurate company-based filtering
            
            // 1. Get all development IDs for the company
            const { data: companyDesarrollos, error: companyDesarrollosError } = await supabase
              .from('desarrollos')
              .select('id')
              .eq('empresa_id', empresaId);
              
            if (companyDesarrollosError) {
              console.error('Error fetching company desarrollos:', companyDesarrollosError);
            }
            
            // 2. If we have developments, count prototypes associated with them
            let prototipoCount = 0;
            if (companyDesarrollos && companyDesarrollos.length > 0) {
              const desarrolloIds = companyDesarrollos.map(d => d.id);
              console.log('Desarrollo IDs for company:', desarrolloIds);
              
              const { data: prototipoData, error: prototipoError } = await supabase
                .from('prototipos')
                .select('id')
                .in('desarrollo_id', desarrolloIds);
                
              if (prototipoError) {
                console.error('Error counting prototipos:', prototipoError);
              } else {
                prototipoCount = prototipoData?.length || 0;
                console.log('Prototipos count:', prototipoCount, 'data:', prototipoData);
              }
            } else {
              console.log('No developments found for company, prototype count is 0');
            }
            
            const data = rawData as {
              isActive: boolean;
              currentPlan?: {
                id: string;
                name: string;
                price: number;
                interval: string;
                features: any;
              };
              renewalDate?: string;
              resourceType?: string;
              resourceLimit?: number;
              resourceCount?: number;
              vendorLimit?: number;
              vendorCount?: number;
              [key: string]: any;
            };
            
            let desarrolloLimit = 0;
            let prototipoLimit = 0;
            
            if (data.currentPlan?.features) {
              const features = data.currentPlan.features;
              if (features.tipo === 'desarrollo') {
                desarrolloLimit = parseInt(features.max_recursos?.toString() || '0', 10);
              } else if (features.tipo === 'prototipo') {
                prototipoLimit = parseInt(features.max_recursos?.toString() || '0', 10);
              }
            }
            
            const isOverDesarrolloLimit = desarrolloLimit > 0 && desarrolloCount > desarrolloLimit;
            const isOverPrototipoLimit = prototipoLimit > 0 && prototipoCount > prototipoLimit;
            
            setSubscriptionInfo({
              isActive: data.isActive || false,
              currentPlan: data.currentPlan,
              renewalDate: data.renewalDate,
              resourceType: data.resourceType,
              resourceLimit: data.resourceLimit,
              resourceCount: data.resourceType === 'desarrollo' ? desarrolloCount : 
                            data.resourceType === 'prototipo' ? prototipoCount : 0,
              vendorLimit: data.vendorLimit,
              vendorCount: data.vendorCount || 0,
              isOverLimit: isOverDesarrolloLimit || isOverPrototipoLimit,
              isOverVendorLimit: data.vendorLimit ? data.vendorCount >= data.vendorLimit : false,
              desarrolloCount: desarrolloCount,
              desarrolloLimit: desarrolloLimit,
              prototipoCount: prototipoCount,
              prototipoLimit: prototipoLimit
            });
            
            setIsLoading(false);
            return;
          }
        }
        
        const { data: userSubscriptions, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (subscriptionError) {
          console.error('Error fetching user subscriptions:', subscriptionError);
          setError(subscriptionError.message);
          setIsLoading(false);
          return;
        }
        
        if (userSubscriptions && userSubscriptions.length > 0) {
          const subscription = userSubscriptions[0];
          const plan = subscription.subscription_plans;
          
          let features: Record<string, any> = {};
          if (typeof plan.features === 'object' && plan.features !== null && !Array.isArray(plan.features)) {
            features = plan.features as Record<string, any>;
          }
          
          const renewalDate = subscription.current_period_end ? 
            new Date(subscription.current_period_end) : undefined;
          
          const maxRecursos = features.max_recursos ? parseInt(features.max_recursos.toString(), 10) : 0;
          const maxVendedores = features.max_vendedores ? parseInt(features.max_vendedores.toString(), 10) : 0;
          const featureType = features.tipo ? features.tipo.toString() : undefined;
          
          setSubscriptionInfo({
            isActive: subscription.status === 'active',
            currentPlan: {
              id: plan.id,
              name: plan.name,
              price: plan.price,
              interval: plan.interval,
              features: features
            },
            renewalDate: renewalDate?.toISOString(),
            resourceLimit: maxRecursos,
            resourceCount: 0,
            vendorLimit: maxVendedores,
            vendorCount: 0,
            isOverLimit: false,
            isOverVendorLimit: false,
            desarrolloCount: 0,
            desarrolloLimit: featureType === 'desarrollo' ? maxRecursos : 0,
            prototipoCount: 0,
            prototipoLimit: featureType === 'prototipo' ? maxRecursos : 0
          });
        } else {
          console.info('No active subscription found');
          setSubscriptionInfo({
            isActive: false,
            isOverLimit: false,
            isOverVendorLimit: false
          });
        }
      } catch (err) {
        console.error('Error in useSubscriptionInfo:', err);
        setError('Error al obtener información de suscripción');
        toast({
          title: 'Error',
          description: 'No se pudo obtener la información de la suscripción',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptionInfo();
  }, [userId, empresaId]);
  
  return { subscriptionInfo, isLoading, error };
};

export default useSubscriptionInfo;
