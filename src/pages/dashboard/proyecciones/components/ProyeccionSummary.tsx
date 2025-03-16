
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-indigo-50 rounded-lg overflow-hidden border border-indigo-100 p-4">
        <div className="mb-2">
          <p className="text-sm text-indigo-700 font-medium">Inversión Inicial</p>
        </div>
        <p className="text-lg font-bold text-indigo-900 financial-number">{formatCurrency(summaryData.propertyValue)}</p>
        <p className="text-xs text-indigo-600/70 mt-1">Valor base de la propiedad</p>
      </div>
      
      <div className="bg-purple-50 rounded-lg overflow-hidden border border-purple-100 p-4">
        <div className="mb-2">
          <p className="text-sm text-purple-700 font-medium">Renta Vacacional</p>
        </div>
        <p className="text-lg font-bold text-purple-900 financial-number">{formatCurrency(summaryData.airbnbProfit)}</p>
        <p className="text-xs text-purple-600/70 mt-1">Ganancia total proyectada</p>
      </div>
      
      <div className="bg-emerald-50 rounded-lg overflow-hidden border border-emerald-100 p-4">
        <div className="mb-2">
          <p className="text-sm text-emerald-700 font-medium">Inversión Alternativa</p>
        </div>
        <p className="text-lg font-bold text-emerald-700 financial-number">{formatCurrency(summaryData.altReturn)}</p>
        <p className="text-xs text-emerald-600/70 mt-1">Rendimiento total en bonos</p>
      </div>
      
      <div className="bg-amber-50 rounded-lg overflow-hidden border border-amber-100 p-4">
        <div className="mb-2">
          <p className="text-sm text-amber-700 font-medium">ROI Promedio Anual</p>
        </div>
        <p className="text-lg font-bold text-amber-800">{summaryData.avgROI.toFixed(1)}%</p>
        <p className="text-xs text-amber-600/70 mt-1">
          +{(summaryData.avgROI - 7).toFixed(1)}% vs inversión alternativa
        </p>
      </div>
    </div>
  );
};
