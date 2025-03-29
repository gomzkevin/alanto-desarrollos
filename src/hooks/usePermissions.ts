
import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';
import { toast } from '@/components/ui/use-toast';
import { useState, useCallback } from 'react';

export const usePermissions = () => {
  const { canCreateResource, isAdmin, empresaId, isLoading: isUserLoading } = useUserRole();
  const { subscriptionInfo, isLoading: isSubscriptionLoading } = useSubscriptionInfo();
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);
  
  // Check if the user has active subscription
  const hasActiveSubscription = useCallback(async () => {
    // Await any pending subscription data load
    if (isSubscriptionLoading) {
      // Wait a moment for subscription data to load if needed
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Mark that we've checked subscription status
    setSubscriptionChecked(true);
    
    return subscriptionInfo.isActive;
  }, [subscriptionInfo.isActive, isSubscriptionLoading]);
  
  // Check if user has exceeded resource limits
  const isWithinResourceLimits = (resourceType?: 'desarrollo' | 'prototipo') => {
    // If user or subscription data is still loading, assume false for safety
    if (isUserLoading || isSubscriptionLoading) {
      return false;
    }
    
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !subscriptionInfo.isActive) {
      return false; // Cualquier usuario de una empresa sin suscripción no puede crear recursos
    }
    
    // Verificar límites específicos para desarrollos
    if (resourceType === 'desarrollo' && 
        subscriptionInfo.desarrolloCount !== undefined && 
        subscriptionInfo.desarrolloLimit !== undefined && 
        subscriptionInfo.desarrolloCount >= subscriptionInfo.desarrolloLimit) {
      console.log(`Límite de desarrollos alcanzado: ${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}`);
      return false;
    }
    
    // Verificar límites específicos para prototipos
    if (resourceType === 'prototipo' && 
        subscriptionInfo.prototipoCount !== undefined && 
        subscriptionInfo.prototipoLimit !== undefined && 
        subscriptionInfo.prototipoCount >= subscriptionInfo.prototipoLimit) {
      console.log(`Límite de prototipos alcanzado: ${subscriptionInfo.prototipoCount}/${subscriptionInfo.prototipoLimit}`);
      return false;
    }
    
    return true;
  };
  
  // Check if user has exceeded vendor limits
  const isWithinVendorLimits = () => {
    // If user or subscription data is still loading, assume false for safety
    if (isUserLoading || isSubscriptionLoading) {
      return false;
    }
    
    // Verificar si el usuario pertenece a una empresa sin suscripción activa
    if (empresaId && !subscriptionInfo.isActive) {
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
  
  // Verifica si los campos obligatorios están llenos
  const validateRequiredFields = (resource: any, resourceType: string) => {
    if (!resource) return false;
    
    if (resourceType === 'desarrollos') {
      // Validar campos obligatorios para Desarrollos
      if (!resource.nombre || resource.nombre.trim() === '') {
        toast({
          title: "Campo requerido",
          description: "El campo 'Nombre' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.ubicacion || resource.ubicacion.trim() === '') {
        toast({
          title: "Campo requerido",
          description: "El campo 'Ubicación' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.total_unidades || isNaN(Number(resource.total_unidades)) || Number(resource.total_unidades) <= 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Total Unidades' es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        });
        return false;
      }
    } 
    else if (resourceType === 'prototipos') {
      // Validar campos obligatorios para Prototipos
      if (!resource.nombre || resource.nombre.trim() === '') {
        toast({
          title: "Campo requerido",
          description: "El campo 'Nombre' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.tipo || resource.tipo.trim() === '') {
        toast({
          title: "Campo requerido",
          description: "El campo 'Tipo' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.precio || isNaN(Number(resource.precio)) || Number(resource.precio) <= 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Precio' es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.superficie || isNaN(Number(resource.superficie)) || Number(resource.superficie) <= 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Superficie (m²)' es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.total_unidades || isNaN(Number(resource.total_unidades)) || Number(resource.total_unidades) <= 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Total Unidades' es obligatorio y debe ser mayor a 0",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.habitaciones || isNaN(Number(resource.habitaciones)) || Number(resource.habitaciones) < 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Habitaciones' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
      
      if (!resource.baños || isNaN(Number(resource.baños)) || Number(resource.baños) < 0) {
        toast({
          title: "Campo requerido",
          description: "El campo 'Baños' es obligatorio",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  };
  
  // Función específica para verificar si se pueden crear prototipos
  // Solo los administradores pueden crear prototipos, los vendedores no
  const canCreatePrototipo = () => {
    // If user or subscription data is still loading, return false for safety
    if (isUserLoading || isSubscriptionLoading) {
      return false;
    }
    
    // Verificamos explícitamente que sea admin para crear prototipos
    if (!isAdmin()) {
      return false;
    }
    
    // Verificar si tiene permiso para crear el recurso
    if (!canCreateResource('prototipos')) {
      return false;
    }
    
    // Verificar si tiene suscripción activa
    if (!subscriptionInfo.isActive) {
      return false;
    }
    
    return isWithinResourceLimits('prototipo');
  };
  
  // Función específica para verificar si se pueden crear desarrollos
  const canCreateDesarrollo = () => {
    // If user or subscription data is still loading, return false for safety
    if (isUserLoading || isSubscriptionLoading) {
      return false;
    }
    
    // Verificar si es admin
    if (!isAdmin()) {
      return false;
    }
    
    // Verificar si tiene permiso para crear el recurso
    if (!canCreateResource('desarrollos')) {
      return false;
    }
    
    // Verificar si tiene suscripción activa
    if (!subscriptionInfo.isActive) {
      return false;
    }
    
    return isWithinResourceLimits('desarrollo');
  };
  
  // Función específica para verificar si se pueden crear unidades individuales
  // Note: This should only be used for individual unit creation, not for generating units for 
  // an existing prototype
  const canCreateUnidad = () => {
    // Verificar permisos básicos
    if (!canCreateResource('unidades')) {
      return false;
    }
    
    // Verificar si tiene suscripción activa
    if (!hasActiveSubscription()) {
      return false;
    }
    
    // Las unidades individuales dependen de los límites de prototipos
    return isWithinResourceLimits('prototipo');
  };
  
  // Función específica para verificar si se pueden crear cotizaciones
  const canCreateCotizacion = () => canCreateResource('cotizaciones');
  
  // Función específica para verificar si se pueden crear leads
  const canCreateLead = () => canCreateResource('leads');
  
  // Función específica para verificar si se pueden crear vendedores
  const canCreateVendedor = () => {
    // If user or subscription data is still loading, return false for safety
    if (isUserLoading || isSubscriptionLoading) {
      return false;
    }
    
    return canCreateResource('vendedores') && isWithinVendorLimits();
  };
  
  // Check if all permissions are loaded
  const isPermissionsLoading = isUserLoading || isSubscriptionLoading || !subscriptionChecked;
  
  return {
    canCreatePrototipo,
    canCreateDesarrollo,
    canCreateCotizacion,
    canCreateLead,
    canCreateUnidad,
    canCreateVendedor,
    hasActiveSubscription,
    isWithinResourceLimits,
    isWithinVendorLimits,
    validateRequiredFields,
    isPermissionsLoading
  };
};

export default usePermissions;
