
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DesarrolloStats {
  unidadesDisponibles: number;
  avanceComercial: number;
  totalUnidades: number;
  ingresos_estimados?: number;
  ingresos_recibidos?: number;
}

export const useDesarrolloStats = (desarrolloId: string) => {
  const fetchDesarrolloStats = async (): Promise<DesarrolloStats> => {
    try {
      // Get the desarrollo details
      const { data: desarrollo, error: desarrolloError } = await supabase
        .from('desarrollos')
        .select('total_unidades, unidades_disponibles, avance_porcentaje')
        .eq('id', desarrolloId)
        .single();
        
      if (desarrolloError) {
        console.error('Error fetching desarrollo stats:', desarrolloError);
        throw desarrolloError;
      }
      
      // Calculate some basic stats
      const unidadesDisponibles = desarrollo?.unidades_disponibles || 0;
      const totalUnidades = desarrollo?.total_unidades || 0;
      const unidadesVendidas = totalUnidades - unidadesDisponibles;
      const avanceComercial = totalUnidades > 0 ? (unidadesVendidas / totalUnidades) * 100 : 0;
      
      // You could add more complex calculations here
      // For example, financial projections based on sales data
      
      return {
        unidadesDisponibles,
        avanceComercial,
        totalUnidades,
        ingresos_estimados: 0, // Replace with actual calculations
        ingresos_recibidos: 0, // Replace with actual calculations
      };
    } catch (error) {
      console.error('Error in fetchDesarrolloStats:', error);
      throw error;
    }
  };
  
  const query = useQuery({
    queryKey: ['desarrollo-stats', desarrolloId],
    queryFn: fetchDesarrolloStats,
    enabled: !!desarrolloId,
  });
  
  return {
    ...query,
    stats: query.data,
  };
};

export default useDesarrolloStats;
