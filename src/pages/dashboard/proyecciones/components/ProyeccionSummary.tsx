
import { formatCurrency } from '@/lib/utils';

interface SummaryData {
  propertyValue: number;
  airbnbProfit: number;
  altReturn: number;
  avgROI: number;
}

interface ProyeccionSummaryProps {
  summaryData: SummaryData;
}

export const ProyeccionSummary = ({ summaryData }: ProyeccionSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 pt-0 mt-4">
      <div className="bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100">
        <div className="p-3 border-b border-indigo-100 bg-indigo-100/50">
          <p className="text-sm text-indigo-700 font-medium">Inversión en Airbnb</p>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-3 border-r border-indigo-100">
            <p className="text-xs text-indigo-600/70 font-medium">Valor de la propiedad</p>
            <p className="text-lg font-bold text-indigo-900 mt-1 financial-number">{formatCurrency(summaryData.propertyValue)}</p>
          </div>
          <div className="p-3">
            <p className="text-xs text-indigo-600/70 font-medium">Retorno total (Airbnb)</p>
            <p className="text-lg font-bold text-indigo-700 mt-1 financial-number">{formatCurrency(summaryData.airbnbProfit)}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-teal-50 rounded-lg overflow-hidden border border-teal-100">
        <div className="p-3 border-b border-teal-100 bg-teal-100/50">
          <p className="text-sm text-teal-700 font-medium">Inversión alternativa</p>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-3 border-r border-teal-100">
            <p className="text-xs text-teal-600/70 font-medium">Capital inicial</p>
            <p className="text-lg font-bold text-teal-900 mt-1 financial-number">{formatCurrency(summaryData.propertyValue)}</p>
          </div>
          <div className="p-3">
            <p className="text-xs text-teal-600/70 font-medium">Retorno alternativo</p>
            <p className="text-lg font-bold text-teal-700 mt-1 financial-number">{formatCurrency(summaryData.altReturn)}</p>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-2 bg-amber-50 p-4 rounded-lg border border-amber-100">
        <p className="text-sm text-amber-600 font-medium">ROI anual promedio</p>
        <p className="text-xl font-bold text-amber-700 mt-1">{summaryData.avgROI.toFixed(1)}%</p>
      </div>
    </div>
  );
};
