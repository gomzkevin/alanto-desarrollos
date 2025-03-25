
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
  // Adding the missing properties for prototype and development counts
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
        
        // Si tenemos un ID de empresa, intentar obtener información de suscripción a nivel de empresa
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
            
            // Type assertion to prevent TypeScript errors
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
            
            // Actualizar state con info de suscripción
            setSubscriptionInfo({
              isActive: data.isActive || false,
              currentPlan: data.currentPlan,
              renewalDate: data.renewalDate,
              resourceType: data.resourceType,
              resourceLimit: data.resourceLimit,
              resourceCount: data.resourceCount || 0,
              vendorLimit: data.vendorLimit,
              vendorCount: data.vendorCount || 0,
              isOverLimit: data.resourceLimit ? data.resourceCount >= data.resourceLimit : false,
              isOverVendorLimit: data.vendorLimit ? data.vendorCount >= data.vendorLimit : false,
              desarrolloCount: data.resourceType === 'desarrollo' ? data.resourceCount || 0 : 0,
              desarrolloLimit: data.resourceType === 'desarrollo' ? data.resourceLimit : 0,
              prototipoCount: data.resourceType === 'prototipo' ? data.resourceCount || 0 : 0,
              prototipoLimit: data.resourceType === 'prototipo' ? data.resourceLimit : 0
            });
            
            setIsLoading(false);
            return;
          }
        }
        
        // Si no hay información de empresa disponible, verificar si el usuario tiene una suscripción personal
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
          
          // Safely extract features
          let features: Record<string, any> = {};
          if (typeof plan.features === 'object' && plan.features !== null && !Array.isArray(plan.features)) {
            features = plan.features as Record<string, any>;
          }
          
          // Convert string dates to Date objects for proper formatting
          const renewalDate = subscription.current_period_end ? 
            new Date(subscription.current_period_end) : undefined;
          
          // Extract resource limits with safer type handling
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
            resourceCount: 0, // No contamos recursos para suscripciones personales por ahora
            vendorLimit: maxVendedores,
            vendorCount: 0, // No contamos vendedores para suscripciones personales por ahora
            isOverLimit: false,
            isOverVendorLimit: false,
            desarrolloCount: 0,
            desarrolloLimit: featureType === 'desarrollo' ? maxRecursos : 0,
            prototipoCount: 0,
            prototipoLimit: featureType === 'prototipo' ? maxRecursos : 0
          });
        } else {
          console.info('No active subscription found');
          // No hay suscripción activa
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
