import { useUserRole } from './useUserRole';
import { useSubscriptionInfo } from './useSubscriptionInfo';
import { toast } from '@/components/ui/use-toast';

export const usePermissions = () => {
  const { canCreateResource, isAdmin, empresaId } = useUserRole();
  const { subscriptionInfo } = useSubscriptionInfo();
  
  // FASE 1 & 5: Verificar si el usuario tiene cualquier plan (incluido Free)
  const hasAnyPlan = () => {
    return subscriptionInfo.currentPlan !== null;
  };
  
  // Mantener compatibilidad con código existente
  const hasActiveSubscription = () => {
    return hasAnyPlan();
  };
  
  // Obtener información del plan actual
  const getCurrentPlanInfo = () => {
    const planName = subscriptionInfo.currentPlan?.name || 'Free';
    const desarrolloLimit = subscriptionInfo.desarrolloLimit || 1;
    const prototipoLimit = subscriptionInfo.prototipoLimit || 0;
    const vendorLimit = subscriptionInfo.vendorLimit || 1;
    const desarrolloCount = subscriptionInfo.desarrolloCount || 0;
    const prototipoCount = subscriptionInfo.prototipoCount || 0;
    const vendorCount = subscriptionInfo.vendorCount || 0;
    
    return {
      planName,
      desarrolloLimit,
      prototipoLimit,
      vendorLimit,
      desarrolloCount,
      prototipoCount,
      vendorCount
    };
  };
  
  // FASE 5: Verificar límites por tipo de recurso con mensajes mejorados
  const isWithinResourceLimits = (resourceType?: 'desarrollo' | 'prototipo') => {
    const { 
      planName, 
      desarrolloLimit, 
      prototipoLimit, 
      desarrolloCount, 
      prototipoCount 
    } = getCurrentPlanInfo();
    
    // Verificar límites específicos para desarrollos
    if (resourceType === 'desarrollo' && desarrolloCount >= desarrolloLimit) {
      toast({
        title: "Límite alcanzado",
        description: `Tu plan ${planName} permite ${desarrolloLimit} desarrollo(s). Actualmente tienes ${desarrolloCount}. Actualiza tu plan para agregar más.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Verificar límites específicos para prototipos
    if (resourceType === 'prototipo' && prototipoCount >= prototipoLimit) {
      toast({
        title: "Límite alcanzado",
        description: `Tu plan ${planName} permite ${prototipoLimit} prototipo(s). Actualmente tienes ${prototipoCount}. Actualiza tu plan para agregar más.`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // FASE 5: Verificar límites de vendedores con mensaje mejorado
  const isWithinVendorLimits = () => {
    const { planName, vendorLimit, vendorCount } = getCurrentPlanInfo();
    
    if (vendorCount >= vendorLimit) {
      toast({
        title: "Límite alcanzado",
        description: `Tu plan ${planName} permite ${vendorLimit} usuario(s). Actualmente tienes ${vendorCount}. Actualiza tu plan para invitar más usuarios.`,
        variant: "destructive",
      });
      return false;
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
    hasAnyPlan,
    isWithinResourceLimits,
    isWithinVendorLimits,
    validateRequiredFields,
    getCurrentPlanInfo
  };
};

export default usePermissions;
