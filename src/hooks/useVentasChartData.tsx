
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';
import { useVentas } from './useVentas';
import { usePagos } from './usePagos';

type MonthlyIncomeData = {
  month: string;
  monthNumber: number;
  year: number;
  total: number;
  count: number;
};

type SaleDistributionData = {
  category: string;
  value: number;
  color: string;
};

type UpcomingPayment = {
  id: string;
  fecha: string;
  monto: number;
  desarrollo: string;
  unidad: string;
  comprador: string;
  esRetrasado: boolean;
};

export const useVentasChartData = () => {
  const { empresaId } = useUserRole();
  const { ventas } = useVentas();
  const [monthlyIncomeData, setMonthlyIncomeData] = useState<MonthlyIncomeData[]>([]);
  const [salesDistributionData, setSalesDistributionData] = useState<SaleDistributionData[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [latePayments, setLatePayments] = useState<UpcomingPayment[]>([]);

  // Fetch all pagos for the company to calculate statistics
  const fetchAllPagos = async () => {
    if (!empresaId) return [];

    try {
      // First, get all desarrollos for the empresa
      const { data: desarrollos, error: desarrollosError } = await supabase
        .from('desarrollos')
        .select('id')
        .eq('empresa_id', empresaId);
      
      if (desarrollosError) {
        console.error('Error fetching desarrollos:', desarrollosError);
        return [];
      }
      
      if (!desarrollos?.length) return [];
      
      // Get prototipos for these desarrollos
      const desarrolloIds = desarrollos.map(d => d.id);
      
      const { data: prototipos, error: prototipesError } = await supabase
        .from('prototipos')
        .select('id, desarrollo_id')
        .in('desarrollo_id', desarrolloIds);
      
      if (prototipesError) {
        console.error('Error fetching prototipos:', prototipesError);
        return [];
      }
      
      if (!prototipos?.length) return [];
      
      // Get unidades for these prototipos
      const prototipoIds = prototipos.map(p => p.id);
      
      const { data: unidades, error: unidadesError } = await supabase
        .from('unidades')
        .select('id, prototipo_id')
        .in('prototipo_id', prototipoIds);
      
      if (unidadesError) {
        console.error('Error fetching unidades:', unidadesError);
        return [];
      }
      
      if (!unidades?.length) return [];
      
      // Get ventas for these unidades
      const unidadIds = unidades.map(u => u.id);
      
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select(`
          id,
          unidad_id
        `)
        .in('unidad_id', unidadIds);
      
      if (ventasError) {
        console.error('Error fetching ventas:', ventasError);
        return [];
      }
      
      if (!ventasData?.length) return [];
      
      const ventaIds = ventasData.map(v => v.id);
      
      // Get compradores_venta for these ventas
      const { data: compradoresVenta, error: compradoresVentaError } = await supabase
        .from('compradores_venta')
        .select('id, venta_id, comprador_id')
        .in('venta_id', ventaIds);
      
      if (compradoresVentaError) {
        console.error('Error fetching compradores_venta:', compradoresVentaError);
        return [];
      }
      
      if (!compradoresVenta?.length) return [];
      
      const compradorVentaIds = compradoresVenta.map(cv => cv.id);
      
      // Finally, get all pagos for these compradores_venta
      const { data: pagos, error: pagosError } = await supabase
        .from('pagos')
        .select(`
          id,
          comprador_venta_id,
          monto,
          fecha,
          estado,
          metodo_pago,
          comprador_venta:compradores_venta(
            venta_id,
            comprador_id,
            comprador:leads(nombre),
            venta:ventas(
              unidad_id,
              unidad:unidades(
                numero,
                prototipo:prototipos(
                  nombre,
                  desarrollo:desarrollos(nombre)
                )
              )
            )
          )
        `)
        .in('comprador_venta_id', compradorVentaIds)
        .order('fecha', { ascending: true });
      
      if (pagosError) {
        console.error('Error fetching pagos:', pagosError);
        return [];
      }
      
      return pagos || [];
    } catch (error) {
      console.error('Error in fetchAllPagos:', error);
      return [];
    }
  };

  const { data: pagos = [], isLoading } = useQuery({
    queryKey: ['ventas-chart-pagos', empresaId],
    queryFn: fetchAllPagos,
    enabled: !!empresaId && ventas.length > 0,
  });

  // Process data for monthly income chart
  useEffect(() => {
    if (!pagos.length) {
      setMonthlyIncomeData([]);
      return;
    }

    try {
      // Group payments by month
      const groupedByMonth: Record<string, MonthlyIncomeData> = {};
      
      pagos.forEach(pago => {
        if (pago.estado !== 'registrado') return;
        
        const date = new Date(pago.fecha);
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${year}-${month}`;
        
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        if (!groupedByMonth[key]) {
          groupedByMonth[key] = {
            month: monthNames[month],
            monthNumber: month,
            year,
            total: 0,
            count: 0
          };
        }
        
        groupedByMonth[key].total += pago.monto;
        groupedByMonth[key].count += 1;
      });
      
      // Convert to array and sort by date
      const monthlyData = Object.values(groupedByMonth).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.monthNumber - b.monthNumber;
      });
      
      // If we have less than 6 months of data, add empty months to fill the chart
      if (monthlyData.length < 6) {
        const today = new Date();
        for (let i = 0; i < 6; i++) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          
          const month = date.getMonth();
          const year = date.getFullYear();
          const key = `${year}-${month}`;
          
          if (!groupedByMonth[key]) {
            const monthNames = [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            
            monthlyData.push({
              month: monthNames[month],
              monthNumber: month,
              year,
              total: 0,
              count: 0
            });
          }
        }
        
        // Sort again after adding empty months
        monthlyData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.monthNumber - b.monthNumber;
        });
      }
      
      // Take the last 6 months
      const last6Months = monthlyData.slice(-6);
      
      setMonthlyIncomeData(last6Months);
    } catch (error) {
      console.error('Error processing monthly income data:', error);
      setMonthlyIncomeData([]);
    }
  }, [pagos]);

  // Process data for sales distribution chart
  useEffect(() => {
    if (!ventas.length) {
      setSalesDistributionData([]);
      return;
    }

    try {
      // Count sales by status
      const statusCounts = {
        en_proceso: 0,
        completada: 0,
        cancelada: 0
      };
      
      ventas.forEach(venta => {
        if (statusCounts[venta.estado as keyof typeof statusCounts] !== undefined) {
          statusCounts[venta.estado as keyof typeof statusCounts]++;
        }
      });
      
      // Convert to chart data format
      const distributionData: SaleDistributionData[] = [
        { category: 'En proceso', value: statusCounts.en_proceso, color: '#f59e0b' },
        { category: 'Completada', value: statusCounts.completada, color: '#10b981' },
        { category: 'Cancelada', value: statusCounts.cancelada, color: '#ef4444' }
      ];
      
      setSalesDistributionData(distributionData);
    } catch (error) {
      console.error('Error processing sales distribution data:', error);
      setSalesDistributionData([]);
    }
  }, [ventas]);

  // Process data for upcoming and late payments
  useEffect(() => {
    if (!pagos.length) {
      setUpcomingPayments([]);
      setLatePayments([]);
      return;
    }

    try {
      const today = new Date();
      const upcomingArray: UpcomingPayment[] = [];
      const lateArray: UpcomingPayment[] = [];
      
      // Get payment plan for compradores to determine upcoming payments
      pagos.forEach(pago => {
        const compVenta = pago.comprador_venta;
        if (!compVenta) return;
        
        const fecha = new Date(pago.fecha);
        const esRetrasado = fecha < today && pago.estado !== 'registrado';
        
        const payment: UpcomingPayment = {
          id: pago.id,
          fecha: pago.fecha,
          monto: pago.monto,
          desarrollo: compVenta.venta?.unidad?.prototipo?.desarrollo?.nombre || 'N/A',
          unidad: `${compVenta.venta?.unidad?.prototipo?.nombre || 'N/A'} - ${compVenta.venta?.unidad?.numero || 'N/A'}`,
          comprador: compVenta.comprador?.nombre || 'N/A',
          esRetrasado
        };
        
        // Add to the appropriate array
        if (esRetrasado) {
          lateArray.push(payment);
        } else if (fecha > today && fecha <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
          // If payment is due within the next 30 days
          upcomingArray.push(payment);
        }
      });
      
      // Sort by date, closest first
      upcomingArray.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
      lateArray.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Most overdue first
      
      setUpcomingPayments(upcomingArray.slice(0, 5)); // Show only top 5
      setLatePayments(lateArray.slice(0, 5)); // Show only top 5
    } catch (error) {
      console.error('Error processing upcoming/late payments data:', error);
      setUpcomingPayments([]);
      setLatePayments([]);
    }
  }, [pagos]);

  return {
    monthlyIncomeData,
    salesDistributionData,
    upcomingPayments,
    latePayments,
    isLoading
  };
};

export default useVentasChartData;
