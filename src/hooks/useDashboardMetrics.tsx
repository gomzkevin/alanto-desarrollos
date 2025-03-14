
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      console.log('Fetching dashboard metrics');
      
      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');
      
      if (leadsError) throw leadsError;
      
      // Fetch desarrollos with their prototipos
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('*, prototipos(*)');
      
      if (desarrollosError) throw desarrollosError;
      
      // Calculate metrics
      const leadsTotal = leads?.length || 0;
      const leadsSeguimiento = leads?.filter(lead => lead.estado === 'seguimiento').length || 0;
      const leadsCotizacion = leads?.filter(lead => lead.estado === 'cotizacion').length || 0;
      const leadsConvertidos = leads?.filter(lead => lead.estado === 'convertido').length || 0;
      
      // Get sales data for the last 6 months
      const now = new Date();
      const salesData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const month = date.toLocaleString('es-MX', { month: 'short' });
        
        // Simple formula to generate realistic sales data
        // In a real app, this would come from the database
        const ventas = Math.floor(1000 + Math.random() * 4000 * (1 - i/10));
        
        return {
          name: month,
          ventas: ventas
        };
      }).reverse();
      
      // Calculate inventory data from desarrollos and prototipos
      let totalUnits = 0;
      let availableUnits = 0;
      let reservedUnits = 0;
      
      desarrollos.forEach(desarrollo => {
        totalUnits += desarrollo.total_unidades || 0;
        availableUnits += desarrollo.unidades_disponibles || 0;
      });
      
      // For this example, assume reserved units are those that are neither available nor sold
      reservedUnits = Math.round(totalUnits * 0.15); // Just an example
      const soldUnits = totalUnits - availableUnits - reservedUnits;
      
      const inventoryData = [
        { name: 'Disponible', value: Math.max(0, availableUnits) },
        { name: 'Reservado', value: Math.max(0, reservedUnits) },
        { name: 'Vendido', value: Math.max(0, soldUnits) }
      ];
      
      return {
        leads: leadsTotal,
        prospectos: leadsSeguimiento,
        cotizaciones: leadsCotizacion,
        ventas: leadsConvertidos,
        desarrollos: desarrollos || [],
        salesData,
        inventoryData
      };
    } catch (error) {
      console.error('Error al obtener métricas:', error);
      throw error;
    }
  };
  
  // Use React Query to fetch and cache the data
  const { 
    data: metrics, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    metrics,
    isLoading,
    error
  };
};

export default useDashboardMetrics;
