
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-4 mt-4">
      <div className="bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100">
        <div className="p-3 border-b border-indigo-100 bg-indigo-100/50">
          <p className="text-sm text-indigo-700 font-medium">Inversión Inicial</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-indigo-600/70 font-medium">Valor de la propiedad</p>
          <p className="text-lg font-bold text-indigo-900 mt-1 financial-number">{formatCurrency(summaryData.propertyValue)}</p>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg overflow-hidden border border-purple-100">
        <div className="p-3 border-b border-purple-100 bg-purple-100/50">
          <p className="text-sm text-purple-700 font-medium">Retorno Airbnb</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-purple-600/70 font-medium">Ganancia total</p>
          <p className="text-lg font-bold text-purple-900 mt-1 financial-number">{formatCurrency(summaryData.airbnbProfit)}</p>
        </div>
      </div>
      
      <div className="bg-teal-50 rounded-lg overflow-hidden border border-teal-100">
        <div className="p-3 border-b border-teal-100 bg-teal-100/50">
          <p className="text-sm text-teal-700 font-medium">Inversión Alternativa</p>
        </div>
        <div className="p-3">
          <p className="text-xs text-teal-600/70 font-medium">Retorno total</p>
          <p className="text-lg font-bold text-teal-700 mt-1 financial-number">{formatCurrency(summaryData.altReturn)}</p>
        </div>
      </div>
      
      <div className="md:col-span-3 bg-amber-50 p-4 rounded-lg border border-amber-100">
        <p className="text-sm text-amber-600 font-medium">ROI anual promedio en renta vacacional</p>
        <p className="text-xl font-bold text-amber-700 mt-1">{summaryData.avgROI.toFixed(1)}%</p>
        <p className="text-xs text-amber-600/70 mt-1">
          El retorno de inversión promedio supera en {(summaryData.avgROI - 7).toFixed(1)}% a la inversión alternativa (7% anual)
        </p>
      </div>
    </div>
  );
};
