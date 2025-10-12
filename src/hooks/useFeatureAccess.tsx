import { useCompanyContext } from '@/contexts/CompanyContext';
import useUserRole from './useUserRole';

interface FeatureMessages {
  [key: string]: string;
}

export const useFeatureAccess = () => {
  const { empresaId } = useUserRole();
  const { subscriptionInfo, isLoading } = useCompanyContext();

  const hasFeature = (featureKey: string): boolean => {
    if (!subscriptionInfo?.plan?.features) return false;
    
    // Si es Free (sin suscripción activa pero con plan Free)
    const features = subscriptionInfo.plan.features;
    return features[featureKey] === true;
  };

  const getPlanLevel = (): number => {
    if (!subscriptionInfo?.plan) return 0;
    
    const planName = subscriptionInfo.plan.name;
    switch (planName) {
      case 'Free': return 0;
      case 'Basic': return 1;
      case 'Grow': return 2;
      case 'Enterprise': return 3;
      default: return 0;
    }
  };

  const getFeatureUpgradeMessage = (featureKey: string): string => {
    const messages: FeatureMessages = {
      analytics_avanzado: 'Las proyecciones avanzadas están disponibles desde el plan Basic ($1,899 MXN/mes)',
      exportacion_avanzada: 'La exportación avanzada requiere plan Basic o superior',
      api_access: 'El acceso a API está disponible en planes Grow ($5,699 MXN/mes) y Enterprise',
      audit_logs: 'Los registros de auditoría están disponibles en planes Grow y Enterprise',
      white_label: 'La personalización White Label está disponible solo en el plan Enterprise',
      soporte_prioritario: 'El soporte prioritario está disponible desde el plan Basic',
      soporte_247: 'El soporte 24/7 está disponible en planes Grow y Enterprise',
    };
    return messages[featureKey] || 'Esta función requiere un plan superior';
  };

  const getRequiredPlanForFeature = (featureKey: string): string => {
    const planMapping: { [key: string]: string } = {
      analytics_avanzado: 'Basic',
      exportacion_avanzada: 'Basic',
      api_access: 'Grow',
      audit_logs: 'Grow',
      white_label: 'Enterprise',
      soporte_prioritario: 'Basic',
      soporte_247: 'Grow',
    };
    return planMapping[featureKey] || 'Basic';
  };

  const canAccessFeature = (featureKey: string): boolean => {
    return hasFeature(featureKey);
  };

  return {
    hasFeature,
    getPlanLevel,
    getFeatureUpgradeMessage,
    getRequiredPlanForFeature,
    canAccessFeature,
    isLoading,
    currentPlan: subscriptionInfo?.plan?.name || 'Free',
  };
};
