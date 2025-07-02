import { useQuery } from '@tanstack/react-query';
import { useCompanyContext } from '@/contexts/CompanyContext';

export const useCompanySubscription = () => {
  const { subscriptionInfo, isLoading, error, refetch } = useCompanyContext();
  
  return {
    subscriptionInfo,
    isLoading,
    error,
    refetch,
    isActive: subscriptionInfo?.isActive || false,
    plan: subscriptionInfo?.plan || null,
    limits: subscriptionInfo?.limits || null,
    resourceCounts: subscriptionInfo?.resourceCounts || null
  };
};