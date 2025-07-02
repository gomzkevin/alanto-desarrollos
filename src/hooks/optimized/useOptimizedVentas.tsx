import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

export const useOptimizedVentas = () => {
  const { empresaId } = useCompanyContext();
  
  return useQuery({
    queryKey: ['optimizedVentas', empresaId],
    queryFn: async () => {
      if (!empresaId) return [];
      
      // Use the optimized view
      const { data, error } = await supabase
        .from('company_ventas_view')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('fecha_inicio', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!empresaId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache for ventas
    gcTime: 5 * 60 * 1000,
  });
};