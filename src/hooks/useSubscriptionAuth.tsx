
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useToast } from '@/hooks/use-toast';

interface UseSubscriptionAuthProps {
  redirectPath?: string;
  requiredModule?: string;
  maxRetries?: number;
}

/**
 * Hook mejorado para verificar si un usuario tiene acceso a ciertas funcionalidades
 * basado en su suscripción y permisos.
 */
export const useSubscriptionAuth = ({ 
  redirectPath,
  requiredModule, 
  maxRetries = 3 
}: UseSubscriptionAuthProps = {}) => {
  const navigate = redirectPath ? useNavigate() : null;
  const { userId, empresaId, userRole, isLoading: userLoading } = useUserRole();
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  const { toast } = useToast();
  
  const [retryCount, setRetryCount] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState(0);
  
  // Función para verificar la autorización
  const checkAuthorization = useCallback(() => {
    // Por el momento, solo validamos que tenga suscripción activa
    // En el futuro, podemos implementar validación por módulos específicos
    const hasActiveSubscription = subscriptionInfo && subscriptionInfo.isActive;
    
    // Para usuarios administradores, siempre darles acceso
    const isAdmin = userRole === 'admin';
    
    // Por ahora, autorizamos si tiene suscripción o es admin
    const hasPermission = isAdmin || !!hasActiveSubscription;
    
    console.log('useSubscriptionAuth - Authorization result:', { 
      hasPermission, 
      userId, 
      empresaId,
      userRole,
      requiredModule,
      subscriptionActive: subscriptionInfo?.isActive,
      isAdmin
    });
    
    return hasPermission;
  }, [userId, empresaId, userRole, subscriptionInfo, requiredModule]);
  
  // Efecto principal para verificación de autorización
  useEffect(() => {
    // Medir tiempo desde el último intento
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheck;
    
    // Evitar verificaciones demasiado frecuentes
    if (lastCheck > 0 && timeSinceLastCheck < 1000) {
      return;
    }
    
    setLastCheck(now);
    
    // Verificar directamente si está cargando cualquiera de los hooks
    const isLoading = userLoading || subscriptionLoading;
    
    // Para debug
    console.log('useSubscriptionAuth - Estado de carga:', {
      userLoading,
      subscriptionLoading,
      retryCount,
      userId,
      empresaId,
      userRole
    });
    
    // Si no hay datos de usuario o suscripción y no está cargando, reintentar hasta maxRetries
    if (!userId && !isLoading && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        console.log(`useSubscriptionAuth - Retrying auth check (${retryCount + 1}/${maxRetries})`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Si ya tenemos userId, verificar autorización
    if (userId) {
      const hasPermission = checkAuthorization();
      setIsAuthorized(hasPermission);
      
      // Redireccionar si no está autorizado y hay una ruta de redirección
      if (!hasPermission && redirectPath && navigate) {
        console.log(`useSubscriptionAuth - Redirecting to ${redirectPath} due to lack of permissions`);
        
        toast({
          title: "Acceso restringido",
          description: `No tienes acceso al módulo ${requiredModule || "solicitado"}`,
          variant: "destructive"
        });
        
        navigate(redirectPath);
      }
    } else if (isLoading) {
      // Si está cargando, mantener en estado indeterminado
      setIsAuthorized(null);
    }
  }, [
    userId, 
    empresaId, 
    userRole, 
    subscriptionInfo, 
    retryCount, 
    requiredModule, 
    redirectPath, 
    navigate, 
    lastCheck, 
    maxRetries, 
    userLoading, 
    subscriptionLoading,
    toast,
    checkAuthorization
  ]);
  
  const isLoading = userLoading || subscriptionLoading || isAuthorized === null;
  
  return {
    isAuthorized: isAuthorized === true,
    isLoading,
    userId,
    empresaId,
    retryCount
  };
};

export default useSubscriptionAuth;
