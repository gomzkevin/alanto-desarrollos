
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useUserRole from './useUserRole';

export const useUsuarios = () => {
  const { toast } = useToast();
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();
  
  // Función para obtener usuarios activos de la empresa
  const fetchUsuarios = async () => {
    if (!empresaId) {
      console.log('No empresa ID available yet, returning empty array');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('activo', true)
        .order('nombre');
        
      if (error) {
        console.error('Error fetching usuarios:', error);
        toast({
          title: 'Error',
          description: `Error al cargar los usuarios: ${error.message}`,
          variant: 'destructive',
        });
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in fetchUsuarios:', error);
      throw error;
    }
  };
  
  // Usar React Query para obtener y cachear los datos
  const { data: usuarios = [], isLoading, error, refetch } = useQuery({
    queryKey: ['usuarios', empresaId],
    queryFn: fetchUsuarios,
    enabled: !!empresaId && !isUserRoleLoading,
    retry: 3,
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30 * 1000),
  });
  
  return {
    usuarios,
    isLoading: isLoading || isUserRoleLoading,
    error,
    refetch
  };
};

export default useUsuarios;
