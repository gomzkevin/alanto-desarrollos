
import { useUserRole } from '@/hooks/useUserRole';

export interface SubscriptionPlan {
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
}

export interface SubscriptionInfo {
  currentPlan: SubscriptionPlan | null;
  isActive: boolean;
  renewalDate: Date | null;
  resourceCount: number;
  resourceLimit: number | null;
  resourceType: 'desarrollo' | 'prototipo' | null;
  currentBilling: number;
  isOverLimit: boolean;
  percentUsed: number;
  vendorCount: number;
  vendorLimit: number | null;
  isOverVendorLimit: boolean;
}

/**
 * Hook simplificado que siempre devuelve acceso completo sin consultar Supabase
 */
export const useCompanySubscription = (empresaId: number | null) => {
  // Valores por defecto simplificados
  const defaultInfo: SubscriptionInfo = {
    currentPlan: null,
    isActive: true,
    renewalDate: null,
    resourceCount: 0,
    resourceLimit: null,
    resourceType: null,
    currentBilling: 0,
    isOverLimit: false,
    percentUsed: 0,
    vendorCount: 0,
    vendorLimit: null,
    isOverVendorLimit: false
  };

  return {
    subscriptionInfo: defaultInfo,
    isLoading: false,
    error: null,
    refetch: async () => ({ data: defaultInfo })
  };
};

export default useCompanySubscription;
