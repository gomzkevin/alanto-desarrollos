
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import useSubscriptionInfo from '@/hooks/useSubscriptionInfo';

export interface UseSubscriptionGuardOptions {
  redirectTo?: string;
  showToast?: boolean;
  requiredFeatures?: string[];
}

/**
 * Hook para verificar si el usuario tiene una suscripción activa
 * y redirigirlo si es necesario
 */
export const useSubscriptionGuard = (options: UseSubscriptionGuardOptions = {}) => {
  const {
    redirectTo = '/dashboard/configuracion',
    showToast = true,
    requiredFeatures = []
  } = options;
  
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // No verificar nada hasta que la información de suscripción esté cargada
    if (isLoading) return;
    
    // Para propósitos de debugging, registrar el estado de la suscripción
    console.log("[useSubscriptionGuard] Subscription status:", {
      isActive: subscriptionInfo.isActive,
      currentPlan: subscriptionInfo.currentPlan?.name,
      resourceType: subscriptionInfo.resourceType,
      resourceCount: subscriptionInfo.resourceCount,
      resourceLimit: subscriptionInfo.resourceLimit
    });
    
    // Verificar si el usuario tiene una suscripción activa
    const hasActiveSub = subscriptionInfo.isActive;
    
    // Si no tiene suscripción activa, mostrar mensaje y redirigir
    if (!hasActiveSub) {
      console.log("[useSubscriptionGuard] No active subscription, redirecting");
      if (showToast) {
        toast({
          title: "Suscripción requerida",
          description: "Necesitas una suscripción activa para acceder a esta funcionalidad",
          variant: "destructive",
        });
      }
      
      navigate(redirectTo);
      setHasAccess(false);
      return;
    }
    
    // Si se requieren características específicas, verificarlas
    if (requiredFeatures.length > 0) {
      // Verificación de características específicas del plan
      // Por ahora, implementamos una lógica simple
      let hasRequiredFeatures = true;
      
      for (const feature of requiredFeatures) {
        // Ejemplo: verificar si tiene tipo específico de recurso
        if (feature === 'prototipo' && subscriptionInfo.resourceType !== 'prototipo') {
          hasRequiredFeatures = false;
        }
        else if (feature === 'desarrollo' && subscriptionInfo.resourceType !== 'desarrollo') {
          hasRequiredFeatures = false;
        }
      }
      
      if (!hasRequiredFeatures) {
        console.log("[useSubscriptionGuard] Missing required features:", requiredFeatures);
        if (showToast) {
          toast({
            title: "Plan insuficiente",
            description: "Tu plan actual no incluye esta funcionalidad",
            variant: "destructive",
          });
        }
        
        navigate(redirectTo);
        setHasAccess(false);
        return;
      }
      
      setHasAccess(true);
    } else {
      // Si solo se requiere una suscripción activa
      console.log("[useSubscriptionGuard] Access granted with active subscription");
      setHasAccess(true);
    }
  }, [isLoading, subscriptionInfo, navigate, redirectTo, showToast, requiredFeatures, toast]);
  
  return {
    hasAccess,
    isLoading: isLoading || hasAccess === null,
    subscriptionInfo
  };
};

export default useSubscriptionGuard;
