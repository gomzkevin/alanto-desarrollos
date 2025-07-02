import { useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

export const useResourceQueries = () => {
  const { empresaId } = useCompanyContext();
  
  const queries = useQueries({
    queries: [
      {
        queryKey: ['desarrollos', empresaId],
        queryFn: async () => {
          if (!empresaId) return [];
          const { data, error } = await supabase
            .from('desarrollos')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        },
        enabled: !!empresaId,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['prototipos', empresaId],
        queryFn: async () => {
          if (!empresaId) return [];
          const { data, error } = await supabase
            .from('prototipos')
            .select(`
              *,
              desarrollo:desarrollos!inner(
                id,
                nombre,
                empresa_id
              )
            `)
            .eq('desarrollo.empresa_id', empresaId)
            .order('created_at', { ascending: false });
          if (error) throw error;
          return data || [];
        },
        enabled: !!empresaId,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['leads', empresaId],
        queryFn: async () => {
          if (!empresaId) return [];
          const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('fecha_creacion', { ascending: false });
          if (error) throw error;
          return data || [];
        },
        enabled: !!empresaId,
        staleTime: 2 * 60 * 1000,
      },
      {
        queryKey: ['usuarios', empresaId],
        queryFn: async () => {
          if (!empresaId) return [];
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('empresa_id', empresaId)
            .eq('activo', true)
            .order('fecha_creacion', { ascending: false });
          if (error) throw error;
          return data || [];
        },
        enabled: !!empresaId,
        staleTime: 10 * 60 * 1000, // Users change less frequently
      }
    ]
  });
  
  const [desarrollosQuery, prototipesQuery, leadsQuery, usuariosQuery] = queries;
  
  return {
    desarrollos: {
      data: desarrollosQuery.data || [],
      isLoading: desarrollosQuery.isLoading,
      error: desarrollosQuery.error,
      refetch: desarrollosQuery.refetch
    },
    prototipos: {
      data: prototipesQuery.data || [],
      isLoading: prototipesQuery.isLoading,
      error: prototipesQuery.error,
      refetch: prototipesQuery.refetch
    },
    leads: {
      data: leadsQuery.data || [],
      isLoading: leadsQuery.isLoading,
      error: leadsQuery.error,
      refetch: leadsQuery.refetch
    },
    usuarios: {
      data: usuariosQuery.data || [],
      isLoading: usuariosQuery.isLoading,
      error: usuariosQuery.error,
      refetch: usuariosQuery.refetch
    },
    isLoading: queries.some(q => q.isLoading),
    refetchAll: () => queries.forEach(q => q.refetch())
  };
};