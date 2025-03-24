
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
 * Hook para autorización basada en suscripciones
 * Verifica si el usuario actual tiene acceso a un módulo/funcionalidad específica
 */
export const useSubscriptionAuth = (options: SubscriptionAuthOptions = {}) => {
  const { 
    requiresSubscription = true, 
    requiredModule, 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, userRole, isAdmin, isSuperAdmin, authChecked } = useUserRole();
  const { subscription, isLoading: isLoadingSubscription } = useSubscriptionStatus();
  
  // Efecto para verificar autorización
  useEffect(() => {
    const checkAuthorization = async () => {
      // Solo proceder cuando tenemos datos de usuario cargados
      if (!authChecked || isLoadingSubscription) {
        return;
      }

      console.log('Verificando autorización de suscripción:', {
        userId,
        empresaId,
        userRole,
        isSuperAdmin: isSuperAdmin(),
        isAdmin: isAdmin(),
        isSubscriptionActive: subscription.isActive,
        requiresSubscription,
        requiredModule
      });

      // Regla 1: Los superadmins siempre tienen acceso global
      if (isSuperAdmin()) {
        console.log('Usuario es superadmin - acceso autorizado globalmente');
        setIsAuthorized(true);
        return;
      }
      
      // Regla 2: Si el módulo no requiere suscripción, todos los usuarios autenticados tienen acceso
      if (!requiresSubscription) {
        console.log('Módulo no requiere suscripción - acceso autorizado');
        setIsAuthorized(true);
        return;
      }
      
      // Regla 3: Si no hay empresaId asignado, el usuario no tiene acceso
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
      
      // Regla 4: Si hay suscripción activa para la empresa, todos sus miembros tienen acceso
      if (subscription.isActive) {
        console.log('Empresa tiene suscripción activa - acceso autorizado');
        setIsAuthorized(true);
        return;
      }
      
      // Si llegamos aquí, no hay suscripción activa - denegar acceso
      console.log('Sin suscripción activa - acceso denegado');
      
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
    };
    
    checkAuthorization();
  }, [
    authChecked, 
    isLoadingSubscription, 
    subscription, 
    userId, 
    empresaId, 
    userRole, 
    requiresSubscription, 
    requiredModule, 
    redirectPath, 
    navigate, 
    isAdmin, 
    isSuperAdmin
  ]);

  return {
    isAuthorized,
    isLoading: isLoadingSubscription || !authChecked || isAuthorized === null,
    subscription
  };
};

export default useSubscriptionAuth;
