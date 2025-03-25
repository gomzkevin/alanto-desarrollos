
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardMetrics = () => {
  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      console.log('Fetching dashboard metrics');
      
      // Fetch leads with their status information
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*');
      
      if (leadsError) throw leadsError;
      
      // Fetch desarrollos with their prototipos and unidades
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select(`
          *,
          prototipos(
            *,
            unidades(*)
          )
        `);
      
      if (desarrollosError) throw desarrollosError;
      
      // Fetch ventas information
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            *,
            prototipo:prototipos(
              nombre,
              desarrollo:desarrollos(nombre)
            )
          )
        `);
        
      if (ventasError) throw ventasError;
      
      // Calculate metrics
      const leadsTotal = leads?.length || 0;
      const leadsSeguimiento = leads?.filter(lead => lead.estado === 'seguimiento').length || 0;
      const leadsCotizacion = leads?.filter(lead => lead.estado === 'cotizacion').length || 0;
      const leadsConvertidos = leads?.filter(lead => lead.estado === 'convertido').length || 0;
      
      // Calculate inventory data
      let totalUnits = 0;
      let availableUnits = 0;
      let reservedUnits = 0;
      
      desarrollos.forEach(desarrollo => {
        if (desarrollo.prototipos) {
          desarrollo.prototipos.forEach(prototipo => {
            if (prototipo.unidades) {
              totalUnits += prototipo.unidades.length;
              availableUnits += prototipo.unidades.filter(u => u.estado === 'disponible').length;
              reservedUnits += prototipo.unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length;
            }
          });
        }
      });
      
      const soldUnits = totalUnits - availableUnits - reservedUnits;
      
      const inventoryData = [
        { name: 'Disponible', value: Math.max(0, availableUnits) },
        { name: 'Reservado', value: Math.max(0, reservedUnits) },
        { name: 'Vendido', value: Math.max(0, soldUnits) }
      ];
      
      // Get sales data for the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      
      const monthLabels = [];
      const salesByMonth = {};
      
      // Initialize monthLabels and salesByMonth with last 6 months
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthName = date.toLocaleString('es-MX', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        monthLabels.unshift(monthName);
        salesByMonth[monthKey] = 0;
      }
      
      // Calculate real sales data by month
      ventas?.forEach(venta => {
        if (venta.estado === 'completada' || venta.estado === 'en_proceso') {
          const ventaDate = new Date(venta.fecha_inicio);
          const monthKey = `${ventaDate.getFullYear()}-${ventaDate.getMonth() + 1}`;
          
          if (salesByMonth.hasOwnProperty(monthKey)) {
            salesByMonth[monthKey] += venta.precio_total || 0;
          }
        }
      });
      
      // Format sales data for chart
      const salesData = Object.keys(salesByMonth).map((key, index) => {
        return {
          name: monthLabels[index],
          ventas: salesByMonth[key]
        };
      });
      
      // Get latest desarrollos and sort them by most recent
      const topDesarrollos = [...desarrollos].sort((a, b) => {
        const dateA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
        const dateB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 3);
      
      return {
        leads: leadsTotal,
        prospectos: leadsSeguimiento,
        cotizaciones: leadsCotizacion,
        ventas: leadsConvertidos,
        desarrollos: topDesarrollos || [],
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
    error,
    refetch 
  } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    metrics,
    isLoading,
    error,
    refetch
  };
};

export default useDashboardMetrics;
