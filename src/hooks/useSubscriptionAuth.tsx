
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export interface SubscriptionAuthOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook para autorización basada en roles (no en suscripciones)
 * Ahora simplemente verifica que el usuario sea admin o vendedor
 */
export const useSubscriptionAuth = (options: SubscriptionAuthOptions = {}) => {
  const { 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, isAdmin, authChecked } = useUserRole();
  const { subscription } = useSubscriptionStatus();
  
  // Efecto para verificar autorización
  useEffect(() => {
    const checkAuthorization = async () => {
      // Solo proceder cuando tenemos datos de usuario cargados
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
        console.log('Usuario sin empresa asignada - acceso denegado');
        toast({
          title: "Sin acceso",
          description: "No tienes una empresa asignada. Contacta al administrador.",
          variant: "destructive"
        });
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // Siempre autorizar a los usuarios autenticados con empresa
      setIsAuthorized(true);
    };
    
    checkAuthorization();
  }, [
    authChecked, 
    userId, 
    empresaId, 
    redirectPath, 
    navigate
  ]);

  return {
    isAuthorized: isAuthorized === null ? true : isAuthorized,
    isLoading: !authChecked || isAuthorized === null,
    subscription
  };
};

export default useSubscriptionAuth;
