
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export type Categoria = {
  id: string;
  nombre: string;
  descripcion?: string;
  empresa_id?: number;
};

// Since 'categorias' table doesn't exist in the database, we'll use a mock function
const fetchCategorias = async (empresaId?: number): Promise<Categoria[]> => {
  console.log('Fetching categorias for empresa:', empresaId);
  
  // Return mock data as the table doesn't exist
  return [
    { id: '1', nombre: 'Residencial', descripcion: 'Propiedades residenciales', empresa_id: empresaId },
    { id: '2', nombre: 'Comercial', descripcion: 'Propiedades comerciales', empresa_id: empresaId },
    { id: '3', nombre: 'Turístico', descripcion: 'Propiedades turísticas', empresa_id: empresaId },
  ];
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
