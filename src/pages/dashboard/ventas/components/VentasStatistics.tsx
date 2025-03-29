
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import { formatCurrency } from '@/lib/utils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

export function VentasStatistics({ ventas, isLoading }) {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Ventas por estado',
        data: [],
        backgroundColor: [],
        borderWidth: 1
      }
    ]
  });

  useEffect(() => {
    if (!ventas || ventas.length === 0) {
      setChartData({
        labels: ['Sin datos'],
        datasets: [
          {
            label: 'Ventas por estado',
            data: [1],
            backgroundColor: ['#e5e7eb'],
            borderWidth: 1
          }
        ]
      });
      return;
    }

    const countByStatus = {
      en_proceso: 0,
      completada: 0,
      cancelada: 0
    };

    ventas.forEach(venta => {
      if (countByStatus[venta.estado] !== undefined) {
        countByStatus[venta.estado]++;
      }
    });

    setChartData({
      labels: ['En proceso', 'Completada', 'Cancelada'],
      datasets: [
        {
          label: 'Ventas por estado',
          data: [
            countByStatus.en_proceso,
            countByStatus.completada,
            countByStatus.cancelada
          ],
          backgroundColor: [
            '#f59e0b', // warning/amber for in progress
            '#10b981', // success/emerald for completed
            '#ef4444', // danger/red for cancelled
          ],
          borderWidth: 1
        }
      ]
    });
  }, [ventas]);

  // Calculate total ventas amount
  const totalVentas = ventas?.reduce((sum, venta) => sum + venta.precio_total, 0) || 0;
  
  // Calculate average sale price
  const avgVentaPrice = ventas && ventas.length > 0 
    ? totalVentas / ventas.length 
    : 0;

  // Get most popular development
  const getPopularDesarrollo = () => {
    if (!ventas || ventas.length === 0) return 'N/A';
    
    const desarrolloCounts = {};
    
    ventas.forEach(venta => {
      if (venta.unidad && venta.unidad.prototipo && venta.unidad.prototipo.desarrollo) {
        const desarrolloName = venta.unidad.prototipo.desarrollo.nombre;
        desarrolloCounts[desarrolloName] = (desarrolloCounts[desarrolloName] || 0) + 1;
      }
    });
    
    const entries = Object.entries(desarrolloCounts);
    if (entries.length === 0) return 'N/A';
    
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          <div className="h-4 w-4 rounded-full bg-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalVentas)}</div>
          <p className="text-xs text-muted-foreground">
            {ventas?.length || 0} unidades
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
          <div className="h-4 w-4 rounded-full bg-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(avgVentaPrice)}</div>
          <p className="text-xs text-muted-foreground">Por unidad</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Desarrollo Popular</CardTitle>
          <div className="h-4 w-4 rounded-full bg-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{getPopularDesarrollo()}</div>
          <p className="text-xs text-muted-foreground">Más unidades vendidas</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estado de Ventas</CardTitle>
          <div className="h-4 w-4 rounded-full bg-amber-500" />
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[80px] w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-t-transparent border-blue-600 animate-spin"></div>
              </div>
            ) : (
              <Doughnut 
                data={chartData} 
                options={{
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    }
                  }
                }} 
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VentasStatistics;
