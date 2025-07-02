import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/contexts/CompanyContext';

export const useOptimizedDashboardMetrics = () => {
  const { empresaId } = useCompanyContext();
  
  return useQuery({
    queryKey: ['dashboardMetrics', empresaId],
    queryFn: async () => {
      if (!empresaId) return null;
      
      // Use the optimized view we created
      const { data: metrics, error: metricsError } = await supabase
        .from('dashboard_metrics_view')
        .select('*')
        .eq('empresa_id', empresaId)
        .single();
      
      if (metricsError) throw metricsError;
      
      // Get revenue data for the last 6 months
      const { data: revenueData, error: revenueError } = await supabase
        .rpc('get_revenue_by_period', { 
          company_id: empresaId,
          period_months: 6 
        });
      
      if (revenueError) throw revenueError;
      
      // Get top 3 latest desarrollos
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id, nombre, ubicacion, fecha_inicio, fecha_entrega, avance_porcentaje')
        .eq('empresa_id', empresaId)
        .order('fecha_inicio', { ascending: false })
        .limit(3);
        
      if (desarrollosError) throw desarrollosError;
      
      // Prepare inventory data for chart
      const inventoryData = [
        { name: 'Disponible', value: metrics.unidades_disponibles },
        { name: 'Reservado', value: metrics.unidades_reservadas },
        { name: 'Vendido', value: metrics.unidades_vendidas }
      ];
      
      return {
        leads: metrics.total_leads,
        prospectos: metrics.prospectos_activos,
        cotizaciones: metrics.total_cotizaciones,
        ventas: metrics.total_ventas,
        desarrollos: desarrollos || [],
        salesData: revenueData || [],
        inventoryData
      };
    },
    enabled: !!empresaId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes in memory
  });
};