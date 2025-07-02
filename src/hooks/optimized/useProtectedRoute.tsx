import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCompanySubscription } from './useCompanySubscription';

interface UseProtectedRouteOptions {
  requireSubscription?: boolean;
  redirectTo?: string;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const { requireSubscription = true, redirectTo = '/dashboard/configuracion' } = options;
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const { isActive: hasActiveSubscription, isLoading: subLoading } = useCompanySubscription();
  const navigate = useNavigate();
  
  const isLoading = authLoading || (requireSubscription && subLoading);
  const hasAccess = isAuthenticated && (!requireSubscription || hasActiveSubscription);
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/auth');
      } else if (requireSubscription && !hasActiveSubscription) {
        navigate(redirectTo);
      }
    }
  }, [isLoading, isAuthenticated, hasActiveSubscription, requireSubscription, navigate, redirectTo]);
  
  return {
    hasAccess,
    isLoading,
    isAuthenticated,
    hasActiveSubscription
  };
};