
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface SubscriptionAccessOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook simplificado que solo verifica autenticación básica
 * Sin ninguna lógica de suscripciones
 */
export const useSubscriptionAccess = (options: SubscriptionAccessOptions = {}) => {
  const { redirectPath = '/dashboard' } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, authChecked, isLoading: isUserLoading } = useUserRole();
  
  // Efecto para verificar autorización básica
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    // Si no hay userId, no está autorizado
    if (!userId) {
      setIsAuthorized(false);
      return;
    }

    // Verificar que el usuario tenga una empresa asignada
    if (!empresaId) {
      toast({
        title: "Sin acceso",
        description: "No tienes una empresa asignada. Contacta al administrador.",
        variant: "destructive"
      });
      navigate(redirectPath);
      setIsAuthorized(false);
      return;
    }

    // Si el usuario está autenticado y tiene empresa, está autorizado
    setIsAuthorized(true);
  }, [authChecked, userId, empresaId, redirectPath, navigate]);

  return {
    isAuthorized: isAuthorized === null ? true : isAuthorized,
    isLoading: isUserLoading || !authChecked || isAuthorized === null,
    subscription: { isActive: true, currentPlan: null, renewalDate: null }
  };
};

export default useSubscriptionAccess;
