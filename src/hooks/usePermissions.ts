
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';
import { toast } from '@/components/ui/use-toast';

export const usePermissions = () => {
  const { canCreateResource, isAdmin, empresaId } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  
  // Check if the user has active subscription
  const hasActiveSubscription = () => {
    return subscriptionInfo.isActive;
  };
  
  // Check if user has exceeded resource limits
  const isWithinResourceLimits = (resourceType?: 'desarrollo' | 'prototipo') => {
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !hasActiveSubscription()) {
      toast({
        title: "Suscripción inactiva",
        description: "Tu empresa no tiene una suscripción activa. Actualiza tu plan para crear recursos.",
        variant: "destructive",
      });
      return false; // Cualquier usuario de una empresa sin suscripción no puede crear recursos
    }
    
    // Verificar límites específicos para desarrollos
    if (resourceType === 'desarrollo' && 
        subscriptionInfo.desarrolloCount !== undefined && 
        subscriptionInfo.desarrolloLimit !== undefined && 
        subscriptionInfo.desarrolloCount >= subscriptionInfo.desarrolloLimit) {
      
      // No mostramos toast aquí para evitar duplicación
      // Las notificaciones ahora se controlan en SubscriptionCheck
      console.log(`Límite de desarrollos alcanzado: ${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}`);
      return false;
    }
    
    // Verificar límites específicos para prototipos
    if (resourceType === 'prototipo' && 
        subscriptionInfo.prototipoCount !== undefined && 
        subscriptionInfo.prototipoLimit !== undefined && 
        subscriptionInfo.prototipoCount >= subscriptionInfo.prototipoLimit) {
      
      // No mostramos toast aquí para evitar duplicación
      // Las notificaciones ahora se controlan en SubscriptionCheck
      console.log(`Límite de prototipos alcanzado: ${subscriptionInfo.prototipoCount}/${subscriptionInfo.prototipoLimit}`);
      return false;
    }
    
    return true;
  };
  
  // Check if user has exceeded vendor limits
  const isWithinVendorLimits = () => {
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !hasActiveSubscription()) {
      return false; // Cualquier usuario de una empresa sin suscripción no puede crear vendedores
    }
    
    if (subscriptionInfo.vendorCount !== undefined && 
        subscriptionInfo.vendorLimit !== undefined &&
        subscriptionInfo.vendorCount >= subscriptionInfo.vendorLimit) {
      
      // No mostramos toast aquí para evitar duplicación
      console.log(`Límite de vendedores alcanzado: ${subscriptionInfo.vendorCount}/${subscriptionInfo.vendorLimit}`);
      return false; // Sobre el límite de vendedores
    }
    
    return true;
  };
  
  // Función específica para verificar si se pueden crear prototipos
  // Solo los administradores pueden crear prototipos, los vendedores no
  const canCreatePrototipo = () => {
    // Verificamos explícitamente que sea admin para crear prototipos
    if (!isAdmin()) {
      return false;
    }
    
    // Verificar si tiene permiso para crear el recurso
    if (!canCreateResource('prototipos')) {
      return false;
    }
    
    // Verificar si tiene suscripción activa
    if (!hasActiveSubscription()) {
      return false;
    }
    
    return isWithinResourceLimits('prototipo');
  };
  
  // Función específica para verificar si se pueden crear desarrollos
  const canCreateDesarrollo = () => {
    // Verificar si es admin
    if (!isAdmin()) {
      return false;
    }
    
    // Verificar si tiene permiso para crear el recurso
    if (!canCreateResource('desarrollos')) {
      return false;
    }
    
    // Verificar si tiene suscripción activa
    if (!hasActiveSubscription()) {
      return false;
    }
    
    return isWithinResourceLimits('desarrollo');
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
