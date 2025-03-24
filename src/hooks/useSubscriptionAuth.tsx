
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';

interface UseSubscriptionAuthProps {
  redirectPath?: string;
  requiredModule?: string;
  maxRetries?: number;
}

/**
 * Hook para verificar si un usuario tiene acceso a ciertas funcionalidades
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
  
  const [retryCount, setRetryCount] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState(0);
  
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
    
    // Si no hay datos de usuario o suscripción y no está cargando, reintentar hasta maxRetries
    if (!userId && !isLoading && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        console.log(`useSubscriptionAuth - Retrying auth check (${retryCount + 1}/${maxRetries})`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    
    // Si ya tenemos empresaId, verificar autorización
    if (empresaId) {
      // Verificar si el módulo requerido está permitido por la suscripción
      let hasPermission = true;
      
      // Si requiere un módulo específico, verificar en la suscripción
      if (requiredModule) {
        // Verificar si tiene una suscripción activa
        const hasActiveSubscription = subscriptionInfo && subscriptionInfo.isActive;
        
        // Por ahora, simplemente autorizar si tiene suscripción activa
        // Aquí se puede implementar lógica más compleja para verificar módulos específicos
        hasPermission = !!hasActiveSubscription;
      }
      
      console.log('useSubscriptionAuth - Authorization result:', { 
        hasPermission, 
        userId, 
        empresaId,
        userRole,
        requiredModule,
        subscriptionActive: subscriptionInfo?.isActive
      });
      
      setIsAuthorized(hasPermission);
      
      // Redireccionar si no está autorizado y hay una ruta de redirección
      if (!hasPermission && redirectPath && navigate) {
        console.log(`useSubscriptionAuth - Redirecting to ${redirectPath} due to lack of permissions`);
        navigate(redirectPath);
      }
    } else {
      // Si no tiene empresaId pero tiene userId, probablemente esté en proceso de carga
      // No establecer autorización como falsa todavía
      console.log('useSubscriptionAuth - User authenticated but no empresa_id yet');
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
    subscriptionLoading
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
