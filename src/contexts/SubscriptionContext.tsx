
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';

export interface SubscriptionContextType {
  isLoading: boolean;
  isSubscriptionActive: boolean;
  hasValidEmpresa: boolean;
  isAdmin: boolean;
  canAccess: (moduleCode?: string, bypassAdmin?: boolean) => boolean;
  subscriptionLimits: Record<string, number>;
  resourceCounts: Record<string, number>;
}

const defaultContext: SubscriptionContextType = {
  isLoading: true,
  isSubscriptionActive: false,
  hasValidEmpresa: false,
  isAdmin: false,
  canAccess: () => false,
  subscriptionLimits: {},
  resourceCounts: {}
};

export const SubscriptionContext = createContext<SubscriptionContextType>(defaultContext);

export const useSubscription = () => useContext(SubscriptionContext);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [accessCache, setAccessCache] = useState<Record<string, boolean>>({});
  const { userId, empresaId, isAdmin, authChecked } = useUserRole();
  const { 
    subscriptionInfo, 
    isLoading: isLoadingSubscription,
    error
  } = useSubscriptionInfo();

  // Default empty objects for resourceLimits and resourceCounts
  const resourceLimits: Record<string, number> = {};
  const resourceCounts: Record<string, number> = {};

  // Determine base subscription state
  const hasValidEmpresa = !!empresaId;
  const isSubscriptionActive = subscriptionInfo.isActive;
  const isLoading = isLoadingSubscription || !authChecked;

  // Function to check if a user can access a specific module
  const canAccess = (moduleCode?: string, bypassAdmin = true): boolean => {
    // Generate a cache key based on inputs
    const cacheKey = `${moduleCode || 'general'}-${bypassAdmin}`;
    
    // Return cached result if available
    if (accessCache[cacheKey] !== undefined) {
      return accessCache[cacheKey];
    }

    // Admin bypass check
    if (bypassAdmin && isAdmin()) {
      setAccessCache(prev => ({ ...prev, [cacheKey]: true }));
      return true;
    }

    // Basic access requirements check
    const hasAccess = hasValidEmpresa && isSubscriptionActive;
    
    // Cache and return result
    setAccessCache(prev => ({ ...prev, [cacheKey]: hasAccess }));
    return hasAccess;
  };

  const value: SubscriptionContextType = {
    isLoading,
    isSubscriptionActive,
    hasValidEmpresa,
    isAdmin: isAdmin(),
    canAccess,
    subscriptionLimits: resourceLimits,
    resourceCounts
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
