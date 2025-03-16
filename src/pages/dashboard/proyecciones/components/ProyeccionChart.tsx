
import { useEffect } from 'react';
import { LineChart } from '@/components/ui/chart';
import { formatCurrencyShort } from '@/lib/utils';

interface ProyeccionChartProps {
  chartData: any[];
}

export const ProyeccionChart = ({ chartData }: ProyeccionChartProps) => {
  useEffect(() => {
    if (chartData.length > 0) {
      console.log("ProyeccionChart - Sample data point:", chartData[0]);
    }
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        Configura los parámetros y haz clic en "Actualizar Proyección" para generar el análisis
      </div>
    );
  }
  
  return (
    <div className="h-[400px] w-full">
      <LineChart 
        data={chartData}
        index="year"
        categories={["Renta vacacional", "Bonos US"]}
        colors={["#9b87f5", "#4ade80"]}
        valueFormatter={(value) => formatCurrencyShort(value)}
        showLegend={true}
        showXAxis={true}
        showYAxis={true}
        yAxisWidth={60}
        showAnimation={true}
        showTooltip={true}
        curveType="linear"
        className="h-[400px] text-xs"
      />
    </div>
  );
};
