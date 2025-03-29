
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export type Subestado = {
  id: string;
  nombre: string;
  estado_principal: string;
  empresa_id?: number;
};

type SubestadoOption = {
  label: string;
  value: string;
};

const fetchSubestados = async (estado?: string, empresaId?: number): Promise<SubestadoOption[]> => {
  let query = supabase.from('subestados').select('*');
  
  if (estado) {
    query = query.eq('estado_principal', estado);
  }
  
  if (empresaId) {
    query = query.eq('empresa_id', empresaId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching subestados:', error);
    return [];
  }
  
  return (data || []).map(subestado => ({
    label: subestado.nombre,
    value: subestado.id
  }));
};

export const useSubestados = (estado?: string) => {
  const { empresaId } = useUserRole();
  
  const { data: subestados, isLoading, error, refetch } = useQuery({
    queryKey: ['subestados', estado, empresaId],
    queryFn: () => fetchSubestados(estado, empresaId),
    enabled: !!empresaId
  });
  
  return {
    subestados: subestados || [],
    isLoading,
    error,
    refetch
  };
};

export default useSubestados;
