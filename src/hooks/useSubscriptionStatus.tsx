
import { useQuery } from '@tanstack/react-query';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

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
 * Hook simplificado que obtiene el estado de suscripción del usuario actual
 * Este hook solo recupera datos y no realiza ninguna verificación de autorización
 */
export const useSubscriptionStatus = () => {
  const { userId, empresaId, isAdmin, isSuperAdmin } = useUserRole();

  // Consultar estado de suscripción desde Supabase
  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscriptionStatus', userId, empresaId],
    queryFn: async (): Promise<SubscriptionStatus> => {
      // Definir estado de suscripción por defecto
      const defaultStatus: SubscriptionStatus = {
        isActive: false,
        currentPlan: null,
        renewalDate: null
      };
      
      // Si es superadmin, siempre tiene una suscripción "activa"
      if (isSuperAdmin()) {
        console.log('Usuario es superadmin - acceso global garantizado');
        return {
          ...defaultStatus,
          isActive: true
        };
      }

      // Si no hay userId o empresaId, no podemos verificar suscripciones
      if (!userId || !empresaId) {
        console.log('No hay userId o empresaId disponible');
        return defaultStatus;
      }

      try {
        console.log('Verificando suscripción para empresaId:', empresaId);
        
        // Usar función de Supabase para obtener el estado de suscripción
        const { data, error } = await supabase
          .rpc('get_user_subscription_status', { user_uuid: userId });
        
        if (error) {
          console.error('Error al obtener estado de suscripción:', error);
          return defaultStatus;
        }
        
        if (!data || typeof data !== 'object') {
          console.log('No se encontraron datos de suscripción válidos');
          return defaultStatus;
        }
        
        console.log('Datos de suscripción obtenidos:', data);
        
        // Extraer plan de suscripción con seguridad de tipos
        let currentPlan: SubscriptionPlan | null = null;
        
        if (data.currentPlan && 
            typeof data.currentPlan === 'object' && 
            !Array.isArray(data.currentPlan)) {
          currentPlan = {
            id: String(data.currentPlan.id || ''),
            name: String(data.currentPlan.name || ''),
            price: Number(data.currentPlan.price || 0),
            interval: (data.currentPlan.interval === 'year' ? 'year' : 'month') as 'month' | 'year',
            features: typeof data.currentPlan.features === 'object' ? data.currentPlan.features : {}
          };
        }
        
        // Construir estado de suscripción a partir de los datos recibidos
        return {
          isActive: !!data.isActive,
          currentPlan,
          renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
          empresa_id: typeof data.empresa_id === 'number' ? data.empresa_id : undefined
        };
      } catch (err) {
        console.error('Error inesperado al verificar suscripción:', err);
        return defaultStatus;
      }
    },
    enabled: !!userId
  });

  return {
    subscription: subscription || {
      isActive: false,
      currentPlan: null,
      renewalDate: null
    },
    isLoading,
    error
  };
};

export default useSubscriptionStatus;
