
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
  const isWithinResourceLimits = () => {
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !hasActiveSubscription()) {
      toast({
        title: "Suscripción inactiva",
        description: "Tu empresa no tiene una suscripción activa. Actualiza tu plan para crear recursos.",
        variant: "destructive",
      });
      return false; // Cualquier usuario de una empresa sin suscripción no puede crear recursos
    }
    
    if (subscriptionInfo.isOverLimit) {
      const resourceType = subscriptionInfo.resourceType === 'desarrollo' ? 'desarrollos' : 'prototipos';
      const currentCount = subscriptionInfo.resourceCount || 0;
      const limit = subscriptionInfo.resourceLimit || 0;
      
      toast({
        title: "Límite alcanzado",
        description: `Has alcanzado el límite de ${limit} ${resourceType} de tu plan (${currentCount}/${limit}). Actualiza tu suscripción para añadir más.`,
        variant: "warning",
      });
      return false; // Sobre el límite de recursos
    }
    
    // Verificar límites específicos para desarrollos
    if (subscriptionInfo.desarrolloCount !== undefined && 
        subscriptionInfo.desarrolloLimit !== undefined && 
        subscriptionInfo.desarrolloCount >= subscriptionInfo.desarrolloLimit) {
      toast({
        title: "Límite de desarrollos alcanzado",
        description: `Has alcanzado el límite de ${subscriptionInfo.desarrolloLimit} desarrollos de tu plan (${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}). Actualiza tu suscripción para añadir más.`,
        variant: "warning",
      });
      return false;
    }
    
    // Verificar límites específicos para prototipos
    if (subscriptionInfo.prototipoCount !== undefined && 
        subscriptionInfo.prototipoLimit !== undefined && 
        subscriptionInfo.prototipoCount >= subscriptionInfo.prototipoLimit) {
      toast({
        title: "Límite de prototipos alcanzado",
        description: `Has alcanzado el límite de ${subscriptionInfo.prototipoLimit} prototipos de tu plan (${subscriptionInfo.prototipoCount}/${subscriptionInfo.prototipoLimit}). Actualiza tu suscripción para añadir más.`,
        variant: "warning",
      });
      return false;
    }
    
    return true;
  };
  
  // Check if user has exceeded vendor limits
  const isWithinVendorLimits = () => {
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !hasActiveSubscription()) {
      toast({
        title: "Suscripción inactiva",
        description: "Tu empresa no tiene una suscripción activa. Actualiza tu plan para crear vendedores.",
        variant: "destructive",
      });
      return false; // Cualquier usuario de una empresa sin suscripción no puede crear vendedores
    }
    
    if (subscriptionInfo.isOverVendorLimit) {
      const currentCount = subscriptionInfo.vendorCount || 0;
      const limit = subscriptionInfo.vendorLimit || 0;
      
      toast({
        title: "Límite de vendedores alcanzado",
        description: `Has alcanzado el límite de ${limit} vendedores de tu plan (${currentCount}/${limit}). Actualiza tu suscripción para añadir más.`,
        variant: "warning",
      });
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
    
    // Comprobación específica para límites de desarrollos
    if (subscriptionInfo.desarrolloCount !== undefined && 
        subscriptionInfo.desarrolloLimit !== undefined && 
        subscriptionInfo.desarrolloCount >= subscriptionInfo.desarrolloLimit) {
      
      // Mostrar toast solo cuando se llama directamente a esta función
      toast({
        title: "Límite de desarrollos alcanzado",
        description: `Has alcanzado el límite de ${subscriptionInfo.desarrolloLimit} desarrollos de tu plan (${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}). Actualiza tu suscripción para añadir más.`,
        variant: "warning",
      });
      
      console.log(`Límite de desarrollos alcanzado: ${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}`);
      return false;
    }
    
    return true;
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
