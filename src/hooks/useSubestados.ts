
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export type Subestado = {
  id: string;
  nombre: string;
  estado_principal: string;
  empresa_id?: number;
};

export type SubestadoOption = {
  label: string;
  value: string;
};

// Since 'subestados' table doesn't exist in the database, we'll use a mock function
const fetchSubestados = async (estado?: string, empresaId?: number): Promise<SubestadoOption[]> => {
  console.log('Fetching subestados for estado:', estado, 'empresa:', empresaId);
  
  // Mock data based on the estado parameter
  const mockSubestados: Subestado[] = [];
  
  if (estado === 'nuevo' || !estado) {
    mockSubestados.push(
      { id: '1', nombre: 'Sin contactar', estado_principal: 'nuevo', empresa_id: empresaId },
      { id: '2', nombre: 'Contactado', estado_principal: 'nuevo', empresa_id: empresaId }
    );
  } else if (estado === 'seguimiento') {
    mockSubestados.push(
      { id: '3', nombre: 'Interesado', estado_principal: 'seguimiento', empresa_id: empresaId },
      { id: '4', nombre: 'Muy interesado', estado_principal: 'seguimiento', empresa_id: empresaId }
    );
  } else if (estado === 'convertido') {
    mockSubestados.push(
      { id: '5', nombre: 'Cliente potencial', estado_principal: 'convertido', empresa_id: empresaId },
      { id: '6', nombre: 'Cliente activo', estado_principal: 'convertido', empresa_id: empresaId }
    );
  }
  
  // Convert to options format
  return mockSubestados.map(subestado => ({
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
