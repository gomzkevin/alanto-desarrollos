
import { useQuery } from '@tanstack/react-query';
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

/**
 * Hook para obtener la información de suscripción de una empresa
 * @param empresaId ID de la empresa para la que se quiere consultar la suscripción
 */
export const useCompanySubscription = (empresaId: number | null) => {
  // Consultar información de suscripción de la empresa
  const { data: subscriptionInfo, isLoading, error, refetch } = useQuery({
    queryKey: ['companySubscription', empresaId],
    queryFn: async (): Promise<SubscriptionInfo> => {
      // Si no hay empresaId, retornamos información vacía
      if (!empresaId) {
        console.log('No empresaId provided, returning default subscription info');
        return getDefaultSubscriptionInfo();
      }

      console.log('Fetching subscription info for empresaId:', empresaId);

      try {
        // Consulta directa para verificar suscripciones activas de la empresa
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('empresa_id', empresaId)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        console.log(`Found ${subscriptions?.length || 0} active subscriptions for empresa ${empresaId}`);
        
        if (subError) {
          console.error('Error fetching empresa subscriptions:', subError);
          return getDefaultSubscriptionInfo();
        } 
        
        // Si encontramos al menos una suscripción activa para la empresa, usamos la primera
        if (subscriptions && subscriptions.length > 0) {
          console.log('Using active company subscription:', subscriptions[0]);
          const info = await processSubscription(subscriptions[0], empresaId);
          console.log('Processed subscription info:', info);
          return info;
        }
        
        // Sin suscripción activa
        console.log('No active subscription found for empresa');
        return getDefaultSubscriptionInfo();
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        return getDefaultSubscriptionInfo();
      }
    },
    enabled: !!empresaId,
  });

  // Función auxiliar para procesar datos de suscripción
  const processSubscription = async (subscription: any, empresaId: number): Promise<SubscriptionInfo> => {
    // Extraer características del plan de forma segura
    const planFeatures = subscription.subscription_plans.features || {};
    let features = {
      tipo: undefined as 'desarrollo' | 'prototipo' | undefined,
      precio_por_unidad: undefined as number | undefined,
      max_vendedores: undefined as number | undefined,
      max_recursos: undefined as number | undefined
    };
    
    // Verificar si features es un objeto y asignar propiedades de forma segura
    if (planFeatures && typeof planFeatures === 'object' && !Array.isArray(planFeatures)) {
      const featuresObj = planFeatures as { [key: string]: Json };
      
      features = {
        tipo: featuresObj.tipo as 'desarrollo' | 'prototipo' | undefined,
        precio_por_unidad: typeof featuresObj.precio_por_unidad === 'number' ? featuresObj.precio_por_unidad : undefined,
        max_vendedores: typeof featuresObj.max_vendedores === 'number' ? featuresObj.max_vendedores : undefined,
        max_recursos: typeof featuresObj.max_recursos === 'number' ? featuresObj.max_recursos : undefined
      };
    }
    
    // Extraer detalles del plan
    const plan: SubscriptionPlan = {
      id: subscription.subscription_plans.id,
      name: subscription.subscription_plans.name,
      price: subscription.subscription_plans.price,
      interval: subscription.subscription_plans.interval as 'month' | 'year',
      features: features
    };

    // Obtener tipo y conteo de recursos del plan
    const resourceType = plan.features.tipo || null;
    
    let resourceCount = 0;
    let vendorCount = 0;
    
    if (empresaId) {
      try {
        // Contar recursos según el tipo
        if (resourceType === 'desarrollo') {
          const { count, error: countError } = await supabase
            .from('desarrollos')
            .select('*', { count: 'exact', head: true })
            .eq('empresa_id', empresaId);
            
          if (countError) {
            console.error('Error counting desarrollos:', countError);
          } else if (count !== null) {
            resourceCount = count;
          }
        } else if (resourceType === 'prototipo') {
          // Obtener IDs de desarrollo para esta empresa
          const { data: desarrollos, error: desarError } = await supabase
            .from('desarrollos')
            .select('id')
            .eq('empresa_id', empresaId);
            
          if (desarError) {
            console.error('Error getting empresa desarrollos:', desarError);
          } else if (desarrollos && desarrollos.length > 0) {
            const desarrolloIds = desarrollos.map(d => d.id);
            
            // Contar prototipos para estos desarrollos
            const { count: protoCount, error: protoError } = await supabase
              .from('prototipos')
              .select('*', { count: 'exact', head: true })
              .in('desarrollo_id', desarrolloIds);
              
            if (protoError) {
              console.error('Error counting prototipos:', protoError);
            } else if (protoCount !== null) {
              resourceCount = protoCount;
            }
          }
        }
      
        // Obtener conteo de vendedores
        const { count: vendors, error: vendorError } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', empresaId)
          .eq('rol', 'vendedor');
          
        if (vendorError) {
          console.error('Error counting vendors:', vendorError);
        } else if (vendors !== null) {
          vendorCount = vendors;
        }
      } catch (countError) {
        console.error('Error in resource or vendor counting:', countError);
      }
    }
    
    // Límites de recursos y vendedores
    const resourceLimit = plan.features.max_recursos || null;
    const vendorLimit = plan.features.max_vendedores || null;
    
    // Calcular monto de facturación
    const precioUnidad = plan.features.precio_por_unidad || 0;
    const currentBilling = resourceCount * precioUnidad;
    
    // Obtener fecha de renovación
    const renewalDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end)
      : null;
    
    // Calcular límites
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
  };

  return {
    subscriptionInfo: subscriptionInfo || getDefaultSubscriptionInfo(),
    isLoading,
    error,
    refetch
  };
};

export default useCompanySubscription;
