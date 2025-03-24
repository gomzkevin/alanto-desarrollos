
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

export interface SubscriptionStatus {
  isActive: boolean;
  currentPlan: SubscriptionPlan | null;
  renewalDate: Date | null;
  empresa_id?: number;
}

/**
 * Hook dummy que elimina completamente la lógica de suscripciones
 * y siempre retorna valores por defecto sin realizar ninguna consulta a Supabase
 */
export const useSubscriptionStatus = () => {
  const { empresaId } = useUserRole();
  
  // Valores por defecto simplificados
  const defaultStatus: SubscriptionStatus = {
    isActive: true,
    currentPlan: null,
    renewalDate: null,
    empresa_id: empresaId || undefined
  };

  return {
    subscription: defaultStatus,
    isLoading: false,
    error: null
  };
};

export default useSubscriptionStatus;
