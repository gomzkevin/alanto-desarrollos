import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface CompanyContextValue {
  empresaId: number | null;
  empresaData: any;
  subscriptionInfo: any;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { empresaId, isLoading: userLoading } = useUserRole();

  // Fetch company data and subscription in parallel
  const { 
    data: companyData, 
    isLoading: isCompanyLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['companyData', empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      
      // Use the optimized function we created
      const { data: subscriptionData, error: subError } = await supabase
        .rpc('get_company_subscription_status', { company_id: empresaId });
      
      if (subError) throw subError;
      
      // Get basic company info
      const { data: empresaInfo, error: empresaError } = await supabase
        .from('empresa_info')
        .select('*')
        .eq('id', empresaId)
        .single();
        
      if (empresaError) throw empresaError;
      
      return {
        empresa: empresaInfo,
        subscription: subscriptionData
      };
    },
    enabled: !!empresaId && !userLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const value: CompanyContextValue = {
    empresaId,
    empresaData: companyData?.empresa || null,
    subscriptionInfo: companyData?.subscription || null,
    isLoading: userLoading || isCompanyLoading,
    error,
    refetch,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};