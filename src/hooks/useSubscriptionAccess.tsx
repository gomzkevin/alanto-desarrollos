
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompanySubscription } from '@/hooks/useCompanySubscription';

export interface SubscriptionAccessOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook centralizado que gestiona autorización de acceso basado en suscripciones
 * Implementación limpia con regla clara: si la empresa tiene suscripción activa,
 * todos los usuarios de esa empresa tienen acceso a los módulos que requieren suscripción
 */
export const useSubscriptionAccess = (options: SubscriptionAccessOptions = {}) => {
  const { 
    requiresSubscription = false, 
    requiredModule, 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, userRole, isAdmin, isSuperAdmin, authChecked, isLoading: isUserLoading } = useUserRole();
  
  // Obtener información de suscripción de la empresa
  const { subscriptionInfo, isLoading: isSubscriptionLoading } = useCompanySubscription(empresaId);

  // Efecto para verificar autorización basada en estado de suscripción
  useEffect(() => {
    // Solo proceder cuando tenemos todos los datos cargados
    const isInitialLoadComplete = !isUserLoading && !isSubscriptionLoading && authChecked;
    
    if (isInitialLoadComplete && requiresSubscription) {
      console.log('Verificando acceso por suscripción:', {
        userId,
        empresaId,
        userRole,
        isSubscriptionActive: subscriptionInfo?.isActive,
        moduleName: requiredModule,
        isAdmin: isAdmin(),
        isSuperAdmin: isSuperAdmin()
      });

      // REGLA 1: Los superadmins siempre tienen acceso completo global
      if (isSuperAdmin()) {
        console.log('El usuario es superadmin con acceso global - autorizado');
        setIsAuthorized(true);
        return;
      }

      // REGLA 2: Verificar que el usuario tenga una empresa asignada
      if (!empresaId) {
        console.log('Usuario sin empresa asignada - no autorizado');
        toast({
          title: "Sin acceso",
          description: "No tienes una empresa asignada. Contacta al administrador.",
          variant: "destructive"
        });
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // REGLA 3: Si la empresa tiene suscripción activa, TODOS los usuarios tienen acceso
      if (subscriptionInfo?.isActive) {
        console.log('La empresa tiene suscripción activa - acceso autorizado para todos los usuarios');
        setIsAuthorized(true);
        return;
      }

      // Si llegamos aquí, no hay suscripción activa - denegar acceso
      console.log('No hay suscripción activa para la empresa - no autorizado');
      
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
    isSubscriptionLoading, 
    isUserLoading, 
    authChecked, 
    navigate, 
    redirectPath, 
    requiredModule, 
    isAdmin, 
    isSuperAdmin,
    userId,
    empresaId,
    requiresSubscription,
    userRole
  ]);

  return {
    isAuthorized,
    isLoading: isSubscriptionLoading || isUserLoading || !authChecked || isAuthorized === null,
    subscription: subscriptionInfo
  };
};

export default useSubscriptionAccess;
