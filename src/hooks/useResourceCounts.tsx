
import { useQuery } from '@tanstack/react-query';
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
 * Hook simplificado que devuelve conteos de recursos sin validación de límites
 * (Versión sin suscripciones ni Stripe)
 */
export const useResourceCounts = () => {
  const { empresaId } = useUserRole();
  
  const {
    data: counts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['resourceCounts', empresaId],
    queryFn: async (): Promise<ResourceCounts> => {
      // Siempre devolvemos un plan sin límites
      return {
        isActive: true,
        currentPlan: {
          id: 'unlimited-plan',
          name: 'Plan Ilimitado',
          price: 0,
          interval: 'month',
          features: {
            tipo: 'desarrollo',
            precio_por_unidad: 0,
            max_vendedores: 999,
            max_recursos: 999
          }
        },
        renewalDate: null,
        resourceType: 'desarrollo',
        resourceLimit: 999,
        resourceCount: 0,
        vendorLimit: 999,
        vendorCount: 0,
        isOverLimit: false,
        percentUsed: 0,
        isOverVendorLimit: false,
        percentVendorUsed: 0
      };
    },
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Función para verificar si se puede añadir un recurso - siempre devuelve true
  const canAddResource = async (): Promise<boolean> => {
    return true;
  };

  // Default empty state for resource counts
  const getDefaultCounts = (): ResourceCounts => ({
    isActive: true,
    currentPlan: {
      id: 'unlimited-plan',
      name: 'Plan Ilimitado',
      price: 0,
      interval: 'month',
      features: {
        tipo: 'desarrollo',
        precio_por_unidad: 0,
        max_vendedores: 999,
        max_recursos: 999
      }
    },
    renewalDate: null,
    resourceType: 'desarrollo',
    resourceLimit: 999,
    resourceCount: 0,
    vendorLimit: 999,
    vendorCount: 0,
    isOverLimit: false,
    percentUsed: 0,
    isOverVendorLimit: false,
    percentVendorUsed: 0
  });

  return {
    resourceCounts: counts || getDefaultCounts(),
    isLoading,
    error,
    refetch,
    canAddResource
  };
};

export default useResourceCounts;
