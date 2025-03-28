
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export const useDashboardMetrics = () => {
  const { empresaId, isLoading: isUserRoleLoading } = useUserRole();
  
  // Function to fetch dashboard metrics
  const fetchDashboardMetrics = async () => {
    try {
      console.log('Fetching dashboard metrics for empresa_id:', empresaId);
      
      if (!empresaId) {
        console.log('No empresa ID available yet, returning empty data');
        return {
          leads: 0,
          prospectos: 0,
          cotizaciones: 0,
          ventas: 0,
          desarrollos: [],
          salesData: [],
          inventoryData: []
        };
      }
      
      // Fetch leads with their status information for this company
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('empresa_id', empresaId);
      
      if (leadsError) throw leadsError;
      
      // Fetch cotizaciones for this company through desarrollos
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id, nombre, ubicacion, total_unidades, unidades_disponibles, avance_porcentaje, fecha_inicio, fecha_entrega')
        .eq('empresa_id', empresaId);
      
      if (desarrollosError) throw desarrollosError;
      
      // Get all desarrollo IDs for this company to filter cotizaciones and ventas
      const desarrolloIds = desarrollos?.map(d => d.id) || [];
      
      // Fetch cotizaciones related to this company's desarrollos
      const { data: cotizaciones, error: cotizacionesError } = await supabase
        .from('cotizaciones')
        .select('*')
        .in('desarrollo_id', desarrolloIds);
        
      if (cotizacionesError) throw cotizacionesError;
      
      // Get prototipos for this company's desarrollos
      const { data: prototipos, error: prototipesError } = await supabase
        .from('prototipos')
        .select('id, desarrollo_id')
        .in('desarrollo_id', desarrolloIds);
        
      if (prototipesError) throw prototipesError;
      
      // Get prototipo IDs
      const prototipoIds = prototipos?.map(p => p.id) || [];
      
      // Get unidades for these prototipos
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, prototipo_id')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) throw unidadesError;
      
      // Get unidad IDs
      const unidadIds = unidades?.map(u => u.id) || [];
      
      // Fetch ventas based on unidades from this company's desarrollos
      const { data: ventas, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          *,
          unidad:unidades(
            id,
            numero,
            prototipo_id,
            prototipo:prototipos(
              nombre,
              desarrollo_id,
              desarrollo:desarrollos(
                nombre,
                empresa_id
              )
            )
          )
        `)
        .in('unidad_id', unidadIds);
        
      if (ventasError) throw ventasError;
      
      // Fetch all compradores_venta for these ventas
      const ventaIds = ventas?.map(v => v.id) || [];
      const { data: compradoresVenta, error: compradoresVentaError } = await supabase
        .from('compradores_venta')
        .select('id, venta_id')
        .in('venta_id', ventaIds);
        
      if (compradoresVentaError) throw compradoresVentaError;
      
      // Get all compradores_venta IDs
      const compradorVentaIds = compradoresVenta?.map(cv => cv.id) || [];
      
      // Fetch all pagos for these compradores_venta
      const { data: pagos, error: pagosError } = await supabase
        .from('pagos')
        .select('id, monto, fecha, comprador_venta_id, estado')
        .in('comprador_venta_id', compradorVentaIds)
        .eq('estado', 'registrado');
        
      if (pagosError) throw pagosError;
      
      // Calculate metrics
      const leadsTotal = leads?.length || 0;
      // Count leads with estado 'convertido' as prospectos activos
      const prospectosBD = leads?.filter(lead => lead.estado === 'convertido').length || 0;
      const cotizacionesBD = cotizaciones?.length || 0;
      const ventasBD = ventas?.length || 0;
      
      // Calculate inventory data
      let totalUnits = 0;
      let availableUnits = 0;
      let reservedUnits = 0;
      
      if (unidades && unidades.length > 0) {
        totalUnits = unidades.length;
        availableUnits = unidades.filter(u => u.estado === 'disponible').length;
        reservedUnits = unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length;
      }
      
      const soldUnits = totalUnits - availableUnits - reservedUnits;
      
      const inventoryData = [
        { name: 'Disponible', value: Math.max(0, availableUnits) },
        { name: 'Reservado', value: Math.max(0, reservedUnits) },
        { name: 'Vendido', value: Math.max(0, soldUnits) }
      ];
      
      // Calculate monthly income based on payment dates
      // Get the last 6 months
      const now = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 5);
      
      // Initialize month data
      const monthLabels = [];
      const salesByMonth = {};
      
      // Create month labels and initialize with zero values
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        const monthName = date.toLocaleString('es-MX', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        // Add to beginning of array to have oldest months first
        monthLabels.unshift(monthName);
        salesByMonth[monthKey] = 0;
      }
      
      // Sum all payments by month
      if (pagos && pagos.length > 0) {
        pagos.forEach(pago => {
          if (pago.estado === 'registrado') {
            const pagoDate = new Date(pago.fecha);
            const monthKey = `${pagoDate.getFullYear()}-${pagoDate.getMonth() + 1}`;
            
            if (salesByMonth.hasOwnProperty(monthKey)) {
              salesByMonth[monthKey] += pago.monto || 0;
            }
          }
        });
      }
      
      // Format sales data for chart
      const salesData = Object.keys(salesByMonth).map((key, index) => {
        return {
          name: monthLabels[index],
          ingresos: salesByMonth[key]
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
        prospectos: prospectosBD,
        cotizaciones: cotizacionesBD,
        ventas: ventasBD,
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
    queryKey: ['dashboardMetrics', empresaId],
    queryFn: fetchDashboardMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!empresaId && !isUserRoleLoading,
  });
  
  return {
    metrics,
    isLoading: isLoading || isUserRoleLoading,
    error,
    refetch
  };
};

export default useDashboardMetrics;
