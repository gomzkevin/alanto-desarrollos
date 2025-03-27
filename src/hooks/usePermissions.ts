
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';

export const usePermissions = () => {
  const { canCreateResource, isAdmin, empresaId } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  
  // Check if the user has active subscription
  const hasActiveSubscription = () => {
    return subscriptionInfo.isActive;
  };
  
  // Check if user has exceeded resource limits
  const isWithinResourceLimits = () => {
    // Verificar si es un administrador sin suscripción activa para su empresa
    if (isAdmin() && !hasActiveSubscription() && empresaId) {
      return false; // Admin sin suscripción para su empresa no puede crear recursos
    }
    
    if (subscriptionInfo.isOverLimit) {
      return false; // Sobre el límite de recursos
    }
    
    return true;
  };
  
  // Check if user has exceeded vendor limits
  const isWithinVendorLimits = () => {
    // Verificar si es un administrador sin suscripción activa para su empresa
    if (isAdmin() && !hasActiveSubscription() && empresaId) {
      return false; // Admin sin suscripción para su empresa no puede crear vendedores
    }
    
    if (subscriptionInfo.isOverVendorLimit) {
      return false; // Sobre el límite de vendedores
    }
    
    return true;
  };
  
  // Función específica para verificar si se pueden crear prototipos
  // Solo los administradores pueden crear prototipos, los vendedores no
  const canCreatePrototipo = () => {
    // Verificamos explícitamente que sea admin para crear prototipos
    return isAdmin() && canCreateResource('prototipos') && isWithinResourceLimits();
  };
  
  // Función específica para verificar si se pueden crear desarrollos
  const canCreateDesarrollo = () => {
    return canCreateResource('desarrollos') && isWithinResourceLimits();
  };
  
  // Función específica para verificar si se pueden crear cotizaciones
  const canCreateCotizacion = () => canCreateResource('cotizaciones');
  
  // Función específica para verificar si se pueden crear leads
  const canCreateLead = () => canCreateResource('leads');
  
  // Función específica para verificar si se pueden crear unidades
  const canCreateUnidad = () => canCreateResource('unidades');
  
  // Función para verificar si se pueden crear vendedores
  const canCreateVendedor = () => {
    return canCreateResource('vendedores') && isWithinVendorLimits();
  };
  
  return {
    canCreatePrototipo,
    canCreateDesarrollo,
    canCreateCotizacion,
    canCreateLead,
    canCreateUnidad,
    canCreateVendedor,
    hasActiveSubscription,
    isWithinResourceLimits,
    isWithinVendorLimits
  };
};

export default usePermissions;
