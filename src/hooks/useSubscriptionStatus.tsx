
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
 * Hook simplificado que siempre devuelve una suscripción activa sin validaciones
 * (Versión sin suscripciones ni Stripe)
 */
export const useSubscriptionStatus = () => {
  const { empresaId } = useUserRole();
  
  // Plan ilimitado estático
  const unlimitedPlan: SubscriptionStatus = {
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
    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    empresa_id: empresaId || undefined
  };

  return {
    subscription: unlimitedPlan,
    isLoading: false,
    error: null
  };
};

export default useSubscriptionStatus;
