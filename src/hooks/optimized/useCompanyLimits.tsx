import { useCompanySubscription } from './useCompanySubscription';

export const useCompanyLimits = () => {
  const { isActive, limits, resourceCounts, isLoading } = useCompanySubscription();
  
  const checkResourceLimit = (resourceType: string, toAdd: number = 1) => {
    if (!isActive || !limits || !resourceCounts) return false;
    
    const currentCount = resourceCounts[resourceType] || 0;
    const maxAllowed = limits.maxRecursos || 0;
    
    if (resourceType === 'vendedores') {
      const maxVendedores = limits.maxVendedores || 0;
      return (currentCount + toAdd) <= maxVendedores;
    }
    
    // For recursos (desarrollos/prototipos based on plan type)
    if (limits.tipo === resourceType) {
      return (currentCount + toAdd) <= maxAllowed;
    }
    
    return true; // No limit for this resource type
  };
  
  const getResourceProgress = (resourceType: string) => {
    if (!isActive || !limits || !resourceCounts) return { current: 0, max: 0, percentage: 0 };
    
    const currentCount = resourceCounts[resourceType] || 0;
    let maxAllowed = 0;
    
    if (resourceType === 'vendedores') {
      maxAllowed = limits.maxVendedores || 0;
    } else if (limits.tipo === resourceType) {
      maxAllowed = limits.maxRecursos || 0;
    }
    
    const percentage = maxAllowed > 0 ? (currentCount / maxAllowed) * 100 : 0;
    
    return {
      current: currentCount,
      max: maxAllowed,
      percentage: Math.min(percentage, 100)
    };
  };
  
  return {
    isActive,
    limits,
    resourceCounts,
    isLoading,
    checkResourceLimit,
    getResourceProgress,
    canAddDesarrollo: () => checkResourceLimit('desarrollos'),
    canAddPrototipo: () => checkResourceLimit('prototipos'),
    canAddVendedor: () => checkResourceLimit('vendedores'),
  };
};