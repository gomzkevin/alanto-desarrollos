
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
    
    // Verificar si el usuario tiene una suscripción activa
    const hasActiveSub = subscriptionInfo.isActive;
    
    // Si no tiene suscripción activa, mostrar mensaje y redirigir
    if (!hasActiveSub) {
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
      // Lógica para verificar características específicas
      // Por ahora, si hay una suscripción activa, se considera que tiene acceso
      setHasAccess(true);
    } else {
      // Si solo se requiere una suscripción activa
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
