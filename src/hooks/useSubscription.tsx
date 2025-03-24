
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
 * Centralized hook that manages subscription data, authorization, and access control
 */
export const useSubscription = (options: SubscriptionAuthOptions = {}) => {
  const { 
    requiresSubscription = false, 
    requiredModule, 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, isAdmin, isSuperAdmin, userRole, authChecked } = useUserRole();
  
  // Fetch subscription data
  const { data: subscriptionInfo, isLoading: isLoadingSubscription, error } = useQuery({
    queryKey: ['subscriptionInfo', userId, empresaId],
    queryFn: async (): Promise<SubscriptionInfo> => {
      // If no empresaId, we can't verify company subscriptions
      if (!empresaId) {
        console.log('No empresaId provided, returning default subscription info');
        return getDefaultSubscriptionInfo();
      }

      console.log('Fetching subscription info for empresaId:', empresaId);

      // SIMPLIFIED APPROACH: First check company subscription, as it's the most likely scenario
      try {
        const { data: empresaSubscription, error: empresaError } = await supabase
          .from('subscriptions')
          .select('*, subscription_plans(*)')
          .eq('empresa_id', empresaId)
          .eq('status', 'active')
          .maybeSingle();

        if (empresaError) {
          console.error('Error fetching empresa subscription:', empresaError);
        } else if (empresaSubscription) {
          console.log('Found active subscription for empresa:', empresaSubscription);
          return await processSubscription(empresaSubscription, empresaId);
        } else {
          console.log('No active company subscription found');
        }

        // If no company subscription and user is admin, check user's personal subscription
        if (userId && (isAdmin() || isSuperAdmin())) {
          const { data: userSubscription, error: userSubError } = await supabase
            .from('subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', userId)
            .eq('status', 'active')
            .maybeSingle();

          if (userSubError) {
            console.error('Error fetching user subscription:', userSubError);
          } else if (userSubscription) {
            console.log('Found active subscription for admin user:', userSubscription);
            return await processSubscription(userSubscription, empresaId);
          }
        }

        // No subscription found
        console.log('No active subscription found for company or admin');
        return getDefaultSubscriptionInfo();
      } catch (error) {
        console.error('Error fetching subscription info:', error);
        return getDefaultSubscriptionInfo();
      }
    },
    enabled: !!authChecked && (!!empresaId || !!userId),
  });

  // Helper function to process subscription data
  const processSubscription = async (subscription: any, empresaId: number | null): Promise<SubscriptionInfo> => {
    // Extract plan features safely
    const planFeatures = subscription.subscription_plans.features || {};
    let features = {
      tipo: undefined as 'desarrollo' | 'prototipo' | undefined,
      precio_por_unidad: undefined as number | undefined,
      max_vendedores: undefined as number | undefined,
      max_recursos: undefined as number | undefined
    };
    
    // Check if features is an object and assign properties safely
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

    console.log('Extracted plan:', plan);

    // Get resource type and count from the plan
    const resourceType = plan.features.tipo || null;
    console.log('Resource type:', resourceType);
    
    let resourceCount = 0;
    let vendorCount = 0;
    
    if (empresaId) {
      try {
        // Count resources (desarrollos or prototipos) based on resource type
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
          // Get desarrollo IDs for this company
          const { data: desarrollos, error: desarError } = await supabase
            .from('desarrollos')
            .select('id')
            .eq('empresa_id', empresaId);
            
          if (desarError) {
            console.error('Error getting empresa desarrollos:', desarError);
          } else if (desarrollos && desarrollos.length > 0) {
            const desarrolloIds = desarrollos.map(d => d.id);
            
            // Count prototipos for these desarrollos
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
      
        // Get vendor count
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
    
    // Resource and vendor limits
    const resourceLimit = plan.features.max_recursos || null;
    const vendorLimit = plan.features.max_vendedores || null;
    
    // Calculate billing amount
    const precioUnidad = plan.features.precio_por_unidad || 0;
    const currentBilling = resourceCount * precioUnidad;
    
    // Get renewal date
    const renewalDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end)
      : null;
    
    // Calculate limits
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

  // Effect to check authorization based on subscription status
  useEffect(() => {
    // Only proceed when we have all the necessary data
    if (!isLoadingSubscription && authChecked && requiresSubscription) {
      console.log('Verifying subscription authorization:', {
        userId,
        empresaId,
        isSubscriptionActive: subscriptionInfo?.isActive,
        moduleName: requiredModule,
        isAdmin: isAdmin(),
        isSuperAdmin: isSuperAdmin(),
        userRole
      });

      // SuperAdmins and admins always have access - THIS IS THE KEY FIX
      if (isSuperAdmin() || isAdmin()) {
        console.log('User is admin or superadmin, access authorized regardless of subscription');
        setIsAuthorized(true);
        return;
      }

      // Vendedores also have access to all modules
      if (userRole === 'vendedor') {
        console.log('User is vendedor, access authorized');
        setIsAuthorized(true);
        return;
      }

      // Check if empresa is assigned
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

      // Check for active subscription
      if (!subscriptionInfo?.isActive) {
        console.log('No active subscription for module:', requiredModule);
        
        const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
        const message = "Tu empresa no tiene una suscripción activa. Por favor, contacta al administrador.";
        
        toast({
          title: "Suscripción requerida",
          description: `No tienes acceso${moduleText}. ${message}`,
          variant: "destructive"
        });
        
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // If we got here, the user is authorized
      console.log('User authorized to access module:', requiredModule);
      setIsAuthorized(true);
    } else if (!requiresSubscription) {
      // If the module doesn't require subscription, automatically authorize
      setIsAuthorized(true);
    }
  }, [
    subscriptionInfo, 
    isLoadingSubscription, 
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
    isLoading: isLoadingSubscription || !authChecked || isAuthorized === null,
    isAuthorized,
    error
  };
};

export default useSubscription;
