
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

interface Desarrollo {
  id: string;
  nombre: string;
  ubicacion: string;
  descripcion: string | null;
  avance_porcentaje: number | null;
  imagen_url: string | null;
  total_unidades: number;
  unidades_disponibles: number;
  fecha_inicio: string | null;
  fecha_entrega: string | null;
  empresa_id?: number;
}

export const useDesarrollos = () => {
  const { userData } = useUserRole();
  
  const fetchDesarrollos = async () => {
    try {
      // First check if the empresa_id column exists
      const { data: hasEmpresaIdColumn, error: columnCheckError } = await supabase
        .rpc('has_column', { table_name: 'desarrollos', column_name: 'empresa_id' });
      
      if (columnCheckError) {
        console.error('Error checking column:', columnCheckError);
        throw new Error('Error checking database structure');
      }
      
      let query = supabase.from('desarrollos').select('*');
      
      // Add empresa_id filter if the column exists and user has an empresa_id
      if (hasEmpresaIdColumn && userData?.empresaId) {
        query = query.eq('empresa_id', userData.empresaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching desarrollos:', error);
        throw new Error('Error fetching desarrollos');
      }
      
      return data as Desarrollo[];
    } catch (error) {
      console.error('Error in fetchDesarrollos:', error);
      throw error;
    }
  };
  
  return useQuery({
    queryKey: ['desarrollos', userData?.empresaId],
    queryFn: fetchDesarrollos,
    enabled: !!userData,
  });
};

export default useDesarrollos;
