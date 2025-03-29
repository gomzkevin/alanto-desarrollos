
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

type AgenteOption = {
  label: string;
  value: string;
};

const fetchAgentes = async (empresaId?: number): Promise<AgenteOption[]> => {
  if (!empresaId) return [];
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email')
      .eq('empresa_id', empresaId)
      .eq('activo', true);
    
    if (error) {
      console.error('Error fetching agentes:', error);
      return [];
    }
    
    return (data || []).map(agente => ({
      label: agente.nombre,
      value: agente.id
    }));
  } catch (error) {
    console.error('Unexpected error fetching agentes:', error);
    return [];
  }
};

export const useLeadAgenteOptions = () => {
  const { empresaId, userId } = useUserRole();
  
  const { data: leadAgenteOptions, isLoading, error } = useQuery({
    queryKey: ['lead-agentes', empresaId],
    queryFn: () => fetchAgentes(empresaId),
    enabled: !!empresaId
  });
  
  return {
    leadAgenteOptions: leadAgenteOptions || [],
    isLoading,
    error,
    currentUserId: userId
  };
};

export default useLeadAgenteOptions;
