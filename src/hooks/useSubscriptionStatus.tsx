
import { useQuery } from '@tanstack/react-query';
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
 * Hook simplificado que simula un estado de suscripción activo para todos los usuarios
 */
export const useSubscriptionStatus = () => {
  const { userId, empresaId } = useUserRole();

  // Consulta simulada que siempre devuelve una suscripción activa
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscriptionStatus', userId, empresaId],
    queryFn: async (): Promise<SubscriptionStatus> => {
      // Simulamos una suscripción activa para todos los usuarios
      return {
        isActive: true,
        currentPlan: {
          id: 'free-plan',
          name: 'Plan Completo',
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
    },
    enabled: !!userId
  });

  return {
    subscription: subscription || {
      isActive: true,
      currentPlan: {
        id: 'default-plan',
        name: 'Plan Completo',
        price: 0,
        interval: 'month',
        features: {
          tipo: 'desarrollo',
          precio_por_unidad: 0,
          max_vendedores: 999,
          max_recursos: 999
        }
      },
      renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    isLoading,
    error: null
  };
};

export default useSubscriptionStatus;
