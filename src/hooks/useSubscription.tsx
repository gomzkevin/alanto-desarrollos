import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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

export interface SubscriptionAuthOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook centralizado que gestiona datos de suscripción, autorización y control de acceso
 * Versión simplificada: Solo considera suscripciones a nivel de empresa
 */
export const useSubscription = (options: SubscriptionAuthOptions = {}) => {
  const { 
    requiresSubscription = false, 
    requiredModule, 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, isAdmin, isSuperAdmin, userRole, authChecked, isLoading: isUserRoleLoading } = useUserRole();
  
  // Consultar información de suscripción de la empresa
  const { data: subscriptionInfo, isLoading: isLoadingSubscription, error } = useQuery({
    queryKey: ['subscriptionInfo', empresaId],
    queryFn: async (): Promise<SubscriptionInfo> => {
      // Si no hay empresaId, no podemos verificar suscripciones
      if (!empresaId) {
        console.log('No empresaId provided, returning default subscription info');
        return getDefaultSubscriptionInfo();
      }

      console.log('Fetching subscription info for empresaId:', empresaId);

      try {
        // Verificar si la empresa tiene una suscripción activa
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('id, status, empresa_id, plan_id, created_at, current_period_end, subscription_plans(id, name, price, interval, features)')
          .eq('empresa_id', empresaId)
          .eq('status', 'active');
          
        console.log(`Found ${subscriptions?.length || 0} active subscriptions for empresa ${empresaId}:`, subscriptions);
        
        if (subError) {
          console.error('Error fetching empresa subscriptions:', subError);
          return getDefaultSubscriptionInfo();
        } 
        
        // Si encontramos al menos una suscripción activa, usamos la primera
        if (subscriptions && subscriptions.length > 0) {
          console.log('Using active subscription:', subscriptions[0]);
          return await processSubscription(subscriptions[0], empresaId);
        }
        
        // Si no hay suscripción activa para esta empresa, verificar si el usuario es superadmin
        if (isSuperAdmin()) {
          console.log('User is superadmin with global access privileges');
          return {
            ...getDefaultSubscriptionInfo(),
            isActive: true, // Los superadmins siempre tienen una suscripción "activa" para control de acceso
          };
        }
        
        // Sin suscripción activa
        console.log('No active subscription found for empresa');
        return getDefaultSubscriptionInfo();
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        return getDefaultSubscriptionInfo();
      }
    },
    enabled: !!authChecked && !!empresaId,
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

  // Efecto para verificar autorización basada en estado de suscripción
  useEffect(() => {
    // Solo proceder cuando tenemos todos los datos necesarios y user data está cargada
    const isInitialLoadComplete = !isUserRoleLoading && !isLoadingSubscription && authChecked;
    
    if (isInitialLoadComplete && requiresSubscription) {
      console.log('Verifying subscription authorization:', {
        userId,
        empresaId,
        userRole,
        isSubscriptionActive: subscriptionInfo?.isActive,
        moduleName: requiredModule,
        isAdmin: isAdmin(),
        isSuperAdmin: isSuperAdmin()
      });

      // Los superadmins siempre tienen acceso completo global
      if (isSuperAdmin()) {
        console.log('User is superadmin with global system access');
        setIsAuthorized(true);
        return;
      }

      // Verificar que el usuario tenga una empresa asignada
      if (!empresaId) {
        console.log('User has no assigned company');
        toast({
          title: "Sin acceso",
          description: "No tienes una empresa asignada. Contacta al administrador.",
          variant: "destructive"
        });
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // REGLA PRINCIPAL: La única condición para autorizar es que la empresa tenga suscripción activa
      // Todos los usuarios de la empresa tienen acceso si la empresa tiene suscripción
      if (subscriptionInfo?.isActive) {
        console.log('Company has active subscription, access authorized for all company users');
        setIsAuthorized(true);
        return;
      }

      // Si llegamos aquí, no hay suscripción activa
      console.log('No active company subscription');
      
      // Mensaje específico según si es admin o no
      let message = isAdmin() 
        ? "Tu empresa no tiene una suscripción activa. Por favor, activa la suscripción en configuración."
        : "Tu empresa no tiene una suscripción activa. Por favor, contacta al administrador.";
        
      const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
      
      toast({
        title: "Suscripción requerida",
        description: `No tienes acceso${moduleText}. ${message}`,
        variant: "destructive"
      });
      
      // Redirigir a admins a la página de configuración, a otros usuarios al dashboard
      const redirectTo = isAdmin() ? '/dashboard/configuracion' : redirectPath;
      navigate(redirectTo);
      setIsAuthorized(false);
    } else if (!requiresSubscription) {
      // Si el módulo no requiere suscripción, autorizar automáticamente
      setIsAuthorized(true);
    }
  }, [
    subscriptionInfo, 
    isLoadingSubscription, 
    isUserRoleLoading, 
    authChecked, 
    navigate, 
    redirectPath, 
    requiredModule, 
    isAdmin, 
    isSuperAdmin,
    userRole,
    userId,
    empresaId,
    requiresSubscription
  ]);

  return {
    subscription: subscriptionInfo || getDefaultSubscriptionInfo(),
    isLoading: isLoadingSubscription || isUserRoleLoading || !authChecked || isAuthorized === null,
    isAuthorized,
    error
  };
};

export default useSubscription;
