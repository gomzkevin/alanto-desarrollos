
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  empresa_id?: number;
};

const fetchCategorias = async (empresaId?: number): Promise<Categoria[]> => {
  let query = supabase.from('categorias').select('*');
  
  if (empresaId) {
    query = query.eq('empresa_id', empresaId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching categorias:', error);
    return [];
  }
  
  return data || [];
};

export const useCategorias = () => {
  const { empresaId } = useUserRole();
  
  const { data: categorias, isLoading, error, refetch } = useQuery({
    queryKey: ['categorias', empresaId],
    queryFn: () => fetchCategorias(empresaId),
    enabled: !!empresaId
  });
  
  return {
    categorias: categorias || [],
    isLoading,
    error,
    refetch
  };
};

export default useCategorias;
