
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';

/**
 * Hook para verificar si el usuario tiene acceso basado en suscripción
 * @param requiredModule - Módulo opcional que se intenta acceder (para mensajes específicos)
 * @param redirectPath - Ruta a la que redirigir si no hay acceso (por defecto: /dashboard)
 */
export const useSubscriptionAuth = (requiredModule?: string, redirectPath: string = '/dashboard') => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, isAdmin, authChecked } = useUserRole();
  const { subscriptionInfo, isLoading: isLoadingSubscription } = useSubscriptionInfo();
  const navigate = useNavigate();

  useEffect(() => {
    // Solo verificar cuando tengamos toda la información necesaria
    if (!isLoadingSubscription && authChecked && userId) {
      console.log('Verificando autorización de suscripción:', {
        userId,
        empresaId,
        isSubscriptionActive: subscriptionInfo.isActive
      });

      if (!empresaId) {
        console.log('Usuario sin empresa asignada');
        toast({
          title: "Sin acceso",
          description: "No tienes una empresa asignada. Contacta al administrador.",
          variant: "destructive"
        });
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      if (!subscriptionInfo.isActive) {
        console.log('Suscripción inactiva');
        const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
        toast({
          title: "Suscripción requerida",
          description: `No tienes acceso${moduleText}. La empresa necesita una suscripción activa.`,
          variant: "destructive"
        });
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // Si llegamos aquí, el usuario está autorizado
      setIsAuthorized(true);
    }
  }, [userId, empresaId, subscriptionInfo, isLoadingSubscription, authChecked, navigate, redirectPath, requiredModule]);

  return {
    isAuthorized,
    isLoading: isLoadingSubscription || !authChecked || isAuthorized === null
  };
};

export default useSubscriptionAuth;
