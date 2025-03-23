
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';

/**
 * Hook para verificar si el usuario tiene acceso basado en suscripción
 * @param requiredModule - Módulo opcional que se intenta acceder (para mensajes específicos)
 * @param redirectPath - Ruta a la que redirigir si no hay acceso (por defecto: /dashboard)
 * @param bypassAdmin - Si los administradores pueden omitir la verificación (por defecto: true)
 */
export const useSubscriptionAuth = (
  requiredModule?: string, 
  redirectPath: string = '/dashboard',
  bypassAdmin: boolean = true
) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  // Always call hooks at the top level, regardless of any conditions
  const { userId, empresaId, isAdmin: isUserAdmin, authChecked } = useUserRole();
  const { subscriptionInfo, isLoading: isLoadingSubscription } = useSubscriptionInfo();

  useEffect(() => {
    // Solo verificar cuando tengamos toda la información necesaria
    if (!isLoadingSubscription && authChecked && userId) {
      console.log('Verificando autorización de suscripción:', {
        userId,
        empresaId,
        isAdmin: isUserAdmin(),
        isSubscriptionActive: subscriptionInfo.isActive,
        bypassAdmin
      });

      // Si el usuario es admin y bypassAdmin está habilitado, autorizar sin más comprobaciones
      if (bypassAdmin && isUserAdmin()) {
        console.log('Usuario es admin, autorizando sin verificar suscripción');
        setIsAuthorized(true);
        return;
      }

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
  }, [userId, empresaId, isUserAdmin, subscriptionInfo, isLoadingSubscription, authChecked, navigate, redirectPath, requiredModule, bypassAdmin]);

  return {
    isAuthorized,
    isLoading: isLoadingSubscription || !authChecked || isAuthorized === null
  };
};

export default useSubscriptionAuth;
