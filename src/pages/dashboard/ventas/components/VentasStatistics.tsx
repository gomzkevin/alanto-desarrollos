import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useVentas } from '@/hooks/useVentas';
import { formatCurrency } from '@/lib/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface VentasStatisticsProps {
  desarrolloId?: string;
  prototipoId?: string;
}

const VentasStatistics = ({ desarrolloId, prototipoId }: VentasStatisticsProps) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Ventas por Prototipo',
        data: [],
        backgroundColor: [],
        borderWidth: 0,
      },
    ],
  });

  const { ventas, isLoading, isError } = useVentas({ desarrolloId, prototipoId });

  useEffect(() => {
    if (!isLoading && !isError) {
      const data = renderPrototipoChartData();
      setChartData(data);
    }
  }, [ventas, isLoading, isError]);

  const renderPrototipoChartData = () => {
    if (!ventas || ventas.length === 0) return [];

    const ventasPorPrototipo: { [key: string]: { count: number; nombre: string } } = {};

    ventas.forEach(venta => {
      if (venta.prototipo) {
        // Use venta.prototipo directly which is defined in the Venta type
        const prototipoId = venta.prototipo.id;
        const prototipoNombre = venta.prototipo.nombre;
        
        if (!ventasPorPrototipo[prototipoId]) {
          ventasPorPrototipo[prototipoId] = { count: 0, nombre: prototipoNombre };
        }
        
        ventasPorPrototipo[prototipoId].count += 1;
      }
    });

    const labels = Object.values(ventasPorPrototipo).map(item => item.nombre);
    const data = Object.values(ventasPorPrototipo).map(item => item.count);
    const backgroundColor = generateColors(labels.length);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Ventas por Prototipo',
          data: data,
          backgroundColor: backgroundColor,
          borderWidth: 0,
        },
      ],
    };
  };

  const generateColors = (num: number) => {
    const colors = [];
    for (let i = 0; i < num; i++) {
      colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
    return colors;
  };

  const totalVentas = ventas ? ventas.length : 0;
  const totalIngresos = ventas ? ventas.reduce((acc, venta) => acc + venta.precio_total, 0) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ventas por Prototipo</h3>
            {chartData.labels && chartData.labels.length > 0 ? (
              <Doughnut data={chartData} />
            ) : (
              <p className="text-muted-foreground">No hay datos de ventas para mostrar.</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">Información General</h3>
            <div className="space-y-2">
              <p>Total de Ventas: {totalVentas}</p>
              <p>Ingresos Totales: {formatCurrency(totalIngresos)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VentasStatistics;
