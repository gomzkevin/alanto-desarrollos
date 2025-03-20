import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, BarChartHorizontal, PieChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { VentaBasica } from '@/hooks/useVentas';
import { formatCurrency } from '@/lib/utils';

// Registrar componentes de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface VentasStatisticsProps {
  ventas: VentaBasica[];
}

const VentasStatistics = ({ ventas }: VentasStatisticsProps) => {
  const [chartView, setChartView] = useState('ventas-por-desarrollo');

  // Calcular estadísticas
  const totalVentas = ventas.length;
  const ventasEnProceso = ventas.filter(v => v.estado === 'en_proceso').length;
  const ventasCompletadas = ventas.filter(v => v.estado === 'completada').length;
  
  // Calcular montos
  const montoTotal = ventas.reduce((sum, v) => sum + v.precio_total, 0);
  const montoPagado = ventas.reduce((sum, v) => {
    // Calcular el monto pagado en cada venta
    const pagado = v.compradores?.reduce((compradorSum, c) => {
      return compradorSum + (c.total_pagado || 0);
    }, 0) || 0;
    return sum + pagado;
  }, 0);
  const montoPendiente = montoTotal - montoPagado;
  
  // Calcular porcentaje de avance general
  const porcentajeAvance = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;

  // Preparar datos para gráficos
  const prepareDataByDesarrollo = () => {
    // Agrupar por desarrollo
    const desarrollos: Record<string, { 
      nombre: string, 
      totalVentas: number,
      montoTotal: number,
      montoPagado: number
    }> = {};

    ventas.forEach(venta => {
      const desarrolloId = venta.unidad?.prototipo?.desarrollo?.id || 'sin-desarrollo';
      const desarrolloNombre = venta.unidad?.prototipo?.desarrollo?.nombre || 'Sin desarrollo';
      
      if (!desarrollos[desarrolloId]) {
        desarrollos[desarrolloId] = {
          nombre: desarrolloNombre,
          totalVentas: 0,
          montoTotal: 0,
          montoPagado: 0
        };
      }
      
      desarrollos[desarrolloId].totalVentas++;
      desarrollos[desarrolloId].montoTotal += venta.precio_total;
      
      // Calcular monto pagado
      const pagado = venta.compradores?.reduce((sum, c) => sum + (c.total_pagado || 0), 0) || 0;
      desarrollos[desarrolloId].montoPagado += pagado;
    });

    return Object.values(desarrollos);
  };

  const desarrollosData = prepareDataByDesarrollo();

  // Datos para el gráfico de barras de ventas por desarrollo
  const ventasPorDesarrolloData = {
    labels: desarrollosData.map(d => d.nombre),
    datasets: [
      {
        label: 'Número de Ventas',
        data: desarrollosData.map(d => d.totalVentas),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        barThickness: 30,
      }
    ]
  };

  // Datos para el gráfico de barras de montos por desarrollo
  const montosPorDesarrolloData = {
    labels: desarrollosData.map(d => d.nombre),
    datasets: [
      {
        label: 'Monto Pagado',
        data: desarrollosData.map(d => d.montoPagado),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        barThickness: 30,
      },
      {
        label: 'Monto Pendiente',
        data: desarrollosData.map(d => d.montoTotal - d.montoPagado),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        barThickness: 30,
      }
    ]
  };

  // Datos para el gráfico circular de estado de ventas
  const estadoVentasData = {
    labels: ['Completadas', 'En Proceso'],
    datasets: [
      {
        data: [ventasCompletadas, ventasEnProceso],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opciones para los gráficos
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label.includes('Monto')) {
              return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  // Renderizar contenido del gráfico según la vista seleccionada
  const renderChartContent = () => {
    switch (chartView) {
      case 'ventas-por-desarrollo':
        return (
          <div className="h-[400px] w-full">
            <Bar data={ventasPorDesarrolloData} options={barOptions} />
          </div>
        );
      case 'montos-por-desarrollo':
        return (
          <div className="h-[400px] w-full">
            <Bar data={montosPorDesarrolloData} options={barOptions} />
          </div>
        );
      case 'estado-ventas':
        return (
          <div className="h-[400px] w-full flex items-center justify-center">
            <div className="h-[300px] w-[300px]">
              <Pie data={estadoVentasData} options={pieOptions} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ventas
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">
              {ventasEnProceso} en proceso, {ventasCompletadas} completadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monto Total
            </CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(montoTotal)}</div>
            <p className="text-xs text-muted-foreground">
              Valor total de todas las ventas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pagado
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(montoPagado)}</div>
            <p className="text-xs text-muted-foreground">
              {porcentajeAvance.toFixed(2)}% del total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendiente
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(montoPendiente)}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - porcentajeAvance).toFixed(2)}% pendiente por cobrar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Ventas</CardTitle>
          <CardDescription>
            Visualiza los datos de ventas por diferentes criterios
          </CardDescription>
          <Tabs value={chartView} onValueChange={setChartView} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="ventas-por-desarrollo">
                <BarChart className="h-4 w-4 mr-2" />
                Ventas por Desarrollo
              </TabsTrigger>
              <TabsTrigger value="montos-por-desarrollo">
                <BarChartHorizontal className="h-4 w-4 mr-2" />
                Montos por Desarrollo
              </TabsTrigger>
              <TabsTrigger value="estado-ventas">
                <PieChart className="h-4 w-4 mr-2" />
                Estado de Ventas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {desarrollosData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">No hay suficientes datos para mostrar estadísticas</p>
            </div>
          ) : (
            renderChartContent()
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VentasStatistics;
