
import { useUserRole } from '@/hooks/useUserRole';

export interface ResourceCounts {
  isActive: boolean;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
    features: {
      tipo?: 'desarrollo' | 'prototipo';
      precio_por_unidad?: number;
      max_vendedores?: number;
      max_recursos?: number;
    };
  } | null;
  renewalDate: string | null;
  resourceType: 'desarrollo' | 'prototipo' | null;
  resourceLimit: number | null;
  resourceCount: number;
  vendorLimit: number | null;
  vendorCount: number;
  isOverLimit: boolean;
  percentUsed: number;
  isOverVendorLimit: boolean;
  percentVendorUsed: number;
}

/**
 * Hook dummy que elimina completamente el conteo de recursos
 * y siempre retorna valores por defecto sin realizar ninguna consulta a Supabase
 */
export const useResourceCounts = () => {
  // Retornar valores por defecto simplificados sin ningún tipo de conteo
  const defaultCounts: ResourceCounts = {
    isActive: true,
    currentPlan: null,
    renewalDate: null,
    resourceType: null,
    resourceLimit: null,
    resourceCount: 0,
    vendorLimit: null,
    vendorCount: 0,
    isOverLimit: false,
    percentUsed: 0,
    isOverVendorLimit: false,
    percentVendorUsed: 0
  };

  // Función para verificar si se puede añadir un recurso - siempre devuelve true
  const canAddResource = async (): Promise<boolean> => {
    return true;
  };

  return {
    resourceCounts: defaultCounts,
    isLoading: false,
    error: null,
    refetch: async () => ({ data: defaultCounts }),
    canAddResource
  };
};

export default useResourceCounts;
