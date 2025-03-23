
import { useEffect, useState } from 'react';
import { AreaChart } from '@tremor/react';
import { formatCurrencyShort } from '@/lib/utils';

interface ProyeccionChartProps {
  chartData: any[];
}

export const ProyeccionChart = ({ chartData }: ProyeccionChartProps) => {
  const [areaChartData, setAreaChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (chartData && chartData.length > 0) {
      try {
        // Asegurarnos que los datos tengan el formato correcto
        const formattedData = chartData.map(item => ({
          year: `Año ${item.year}`,
          "Renta vacacional": Number(item.airbnbProfit || item["Renta vacacional"] || 0),
          "Bonos US": Number(item.alternativeInvestment || item["Bonos US"] || 0)
        }));
        
        setAreaChartData(formattedData);
      } catch (error) {
        console.error("Error formatting chart data:", error);
        setAreaChartData([]);
      }
    } else {
      setAreaChartData([]);
    }
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        Configura los parámetros y haz clic en "Actualizar Proyección" para generar el análisis
      </div>
    );
  }
  
  return (
    <div className="h-[400px] w-full mt-4">
      <AreaChart 
        data={areaChartData}
        index="year"
        categories={["Renta vacacional", "Bonos US"]}
        colors={["indigo", "#0EA5E9"]}
        valueFormatter={(value) => formatCurrencyShort(value)}
        showLegend={true}
        showGridLines={true}
        showXAxis={true}
        showYAxis={true}
        yAxisWidth={60}
        className="h-[400px]"
      />
    </div>
  );
};
