
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from './useUserRole';
import { useSubscription } from './useSubscription';

export interface AuthOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

/**
 * Hook centralizado que combina la verificación de roles y suscripciones
 * para proporcionar un sistema unificado de autorización
 */
export const useAuth = (options: AuthOptions = {}) => {
  const { 
    requiresSubscription = false,
    requiredModule,
    redirectPath = '/dashboard' 
  } = options;

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();
  
  // Combinar información de rol y suscripción
  const { 
    userId, 
    userEmail, 
    userRole, 
    userName, 
    empresaId, 
    isAdmin, 
    isSuperAdmin, 
    canCreateResource,
    isLoading: isLoadingUser, 
    authChecked 
  } = useUserRole();
  
  // Usar el hook de suscripción solo si se requiere verificación de suscripción
  const { 
    subscription, 
    isLoading: isLoadingSubscription 
  } = useSubscription({
    requiresSubscription,
    requiredModule,
    redirectPath
  });

  // Verificar capacidades específicas basadas en el módulo y rol
  const hasCapability = (capability: string): boolean => {
    // Superadmin siempre tiene todas las capacidades
    if (isSuperAdmin()) return true;
    
    // Verificaciones específicas por capacidad
    switch (capability) {
      case 'manage_users':
        return isAdmin();
      case 'create_development':
        return isAdmin() || userRole === 'vendedor';
      case 'view_sales':
        return isAdmin() || userRole === 'vendedor';
      // Puedes agregar más capacidades específicas aquí
      default:
        return false;
    }
  };

  // Efecto para verificar autorización cuando cambian los datos relevantes
  useEffect(() => {
    // Solo verificar cuando tengamos los datos necesarios
    if (!isLoadingUser && authChecked) {
      console.log('Verificando autorización:', {
        userId,
        empresaId,
        userRole,
        requiresSubscription,
        moduleName: requiredModule
      });

      // Superadmins y admins siempre tienen acceso básico
      if (isSuperAdmin() || isAdmin()) {
        console.log('Usuario admin, autorizado');
        setIsAuthorized(true);
        return;
      }

      // Vendedores tienen acceso a la mayoría de módulos
      if (userRole === 'vendedor') {
        console.log('Usuario vendedor, autorizado');
        setIsAuthorized(true);
        return;
      }

      // Verificar si el usuario tiene empresa asignada
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

      // Si requiere suscripción, verificar estado
      if (requiresSubscription && !subscription.isActive) {
        console.log('Suscripción inactiva para módulo:', requiredModule);
        
        const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
        const message = isAdmin() 
          ? "Tu empresa no tiene una suscripción activa. Por favor, activa la suscripción en configuración."
          : "Tu empresa no tiene una suscripción activa. Por favor, contacta al administrador.";
        
        toast({
          title: "Suscripción requerida",
          description: `No tienes acceso${moduleText}. ${message}`,
          variant: "destructive"
        });
        
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // Si llegamos aquí, el usuario está autorizado
      console.log('Usuario autorizado');
      setIsAuthorized(true);
    } else if (!requiresSubscription) {
      // Si no requiere suscripción, autorizar sin verificar suscripción
      setIsAuthorized(true);
    }
  }, [
    userId, 
    empresaId, 
    userRole, 
    isLoadingUser, 
    authChecked, 
    requiresSubscription, 
    subscription?.isActive, 
    requiredModule, 
    redirectPath, 
    navigate, 
    isAdmin, 
    isSuperAdmin
  ]);

  return {
    isAuthorized,
    isLoading: isLoadingUser || (requiresSubscription && isLoadingSubscription) || isAuthorized === null,
    hasCapability,
    userId,
    userEmail,
    userRole,
    userName,
    isAdmin,
    isSuperAdmin,
    subscription: subscription
  };
};

export default useAuth;
