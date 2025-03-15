
import { LineChart } from '@/components/ui/chart';
import { formatCurrencyShort } from '@/lib/utils';

interface ProyeccionChartProps {
  chartData: any[];
}

export const ProyeccionChart = ({ chartData }: ProyeccionChartProps) => {
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        Haz clic en "Crear Proyección" para generar el análisis
      </div>
    );
  }
  
  return (
    <div className="h-[400px] w-full">
      <LineChart 
        data={chartData}
        index="year_label"
        categories={["Renta vacacional", "Bonos US"]}
        colors={["#9b87f5", "#4ade80"]}
        valueFormatter={(value) => formatCurrencyShort(value)}
        showLegend={true}
        showXAxis={true}
        showYAxis={true}
        yAxisWidth={60}
        showAnimation={true}
        showTooltip={true}
        showGradient={true}
        className="h-[400px] text-xs"
      />
    </div>
  );
};
