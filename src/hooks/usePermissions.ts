
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';

export const usePermissions = () => {
  const { canCreateResource, isAdmin } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  
  // Check if the user has active subscription
  const hasActiveSubscription = () => {
    return subscriptionInfo.isActive;
  };
  
  // Check if user has exceeded resource limits
  const isWithinResourceLimits = () => {
    if (isAdmin() && !hasActiveSubscription()) {
      return false; // Admin without subscription can't create resources
    }
    
    if (subscriptionInfo.isOverLimit) {
      return false; // Over the resource limit
    }
    
    return true;
  };
  
  // Check if user has exceeded vendor limits
  const isWithinVendorLimits = () => {
    if (isAdmin() && !hasActiveSubscription()) {
      return false; // Admin without subscription can't create vendors
    }
    
    if (subscriptionInfo.isOverVendorLimit) {
      return false; // Over the vendor limit
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
