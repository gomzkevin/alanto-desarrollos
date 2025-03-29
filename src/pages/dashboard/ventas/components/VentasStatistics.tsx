
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Venta } from '@/hooks/ventas/types';
import { formatCurrency } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface VentasStatisticsProps {
  ventas: Venta[];
  isLoading: boolean;
}

export const VentasStatistics = ({ ventas, isLoading }: VentasStatisticsProps) => {
  const [chartData, setChartData] = useState({
    labels: ['En proceso', 'Completadas', 'Canceladas'],
    datasets: [
      {
        label: 'Estado de ventas',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)', // yellow
          'rgba(75, 192, 192, 0.6)', // green
          'rgba(255, 99, 132, 0.6)', // red
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    if (ventas && ventas.length > 0) {
      // Count ventas by estado
      const enProceso = ventas.filter(v => v.estado === 'en_proceso').length;
      const completadas = ventas.filter(v => v.estado === 'completada').length;
      const canceladas = ventas.filter(v => v.estado === 'cancelada').length;
      
      setChartData({
        labels: ['En proceso', 'Completadas', 'Canceladas'],
        datasets: [
          {
            label: 'Estado de ventas',
            data: [enProceso, completadas, canceladas],
            backgroundColor: [
              'rgba(255, 206, 86, 0.6)', // yellow
              'rgba(75, 192, 192, 0.6)', // green
              'rgba(255, 99, 132, 0.6)', // red
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [ventas]);

  // Group ventas by prototipo and calculate total
  const ventasByPrototipo = ventas.reduce((acc, venta) => {
    const prototipoId = venta.unidad.prototipo_id;
    const prototipoNombre = venta.prototipo?.nombre || 'Desconocido';
    const key = `${prototipoId}-${prototipoNombre}`;
    
    if (!acc[key]) {
      acc[key] = {
        id: prototipoId,
        nombre: prototipoNombre,
        count: 0,
        total: 0
      };
    }
    
    acc[key].count += 1;
    acc[key].total += Number(venta.precio_total) || 0;
    
    return acc;
  }, {} as Record<string, { id: string; nombre: string; count: number; total: number }>);

  const prototipoStats = Object.values(ventasByPrototipo).sort((a, b) => b.count - a.count);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Ventas</CardTitle>
            <CardDescription>Distribución de ventas por estado</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-64">
            <div className="h-32 w-32 rounded-full bg-gray-100 animate-pulse"></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Prototipo</CardTitle>
            <CardDescription>Prototipos más vendidos</CardDescription>
          </CardHeader>
          <CardContent className="h-64 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No hay datos de ventas disponibles para mostrar estadísticas.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Estado de Ventas</CardTitle>
          <CardDescription>Distribución de ventas por estado</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-64 w-64">
            <Doughnut 
              data={chartData}
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Prototipo</CardTitle>
          <CardDescription>Prototipos más vendidos</CardDescription>
        </CardHeader>
        <CardContent className="h-64 overflow-auto">
          <div className="space-y-4">
            {prototipoStats.map((stat) => (
              <div key={stat.id} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{stat.nombre}</span>
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded">{stat.count} ventas</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total: {formatCurrency(stat.total)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasStatistics;
