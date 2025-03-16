
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
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl overflow-hidden border border-indigo-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="mb-2">
          <p className="text-sm font-medium text-indigo-700 flex items-center">
            <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
            Inversión Inicial
          </p>
        </div>
        <p className="text-xl font-bold text-indigo-900 financial-number">{formatCurrency(summaryData.propertyValue)}</p>
        <p className="text-xs text-indigo-600/70 mt-1">Valor base de la propiedad</p>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl overflow-hidden border border-purple-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="mb-2">
          <p className="text-sm font-medium text-purple-700 flex items-center">
            <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
            Renta Vacacional
          </p>
        </div>
        <p className="text-xl font-bold text-purple-900 financial-number">{formatCurrency(summaryData.airbnbProfit)}</p>
        <p className="text-xs text-purple-600/70 mt-1">Ganancia total proyectada</p>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl overflow-hidden border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="mb-2">
          <p className="text-sm font-medium text-emerald-700 flex items-center">
            <span className="w-2 h-2 bg-emerald-600 rounded-full mr-2"></span>
            Inversión Alternativa
          </p>
        </div>
        <p className="text-xl font-bold text-emerald-700 financial-number">{formatCurrency(summaryData.altReturn)}</p>
        <p className="text-xs text-emerald-600/70 mt-1">Rendimiento total en bonos</p>
      </div>
      
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden border border-amber-100 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="mb-2">
          <p className="text-sm font-medium text-amber-700 flex items-center">
            <span className="w-2 h-2 bg-amber-600 rounded-full mr-2"></span>
            ROI Promedio Anual
          </p>
        </div>
        <p className="text-xl font-bold text-amber-800">{summaryData.avgROI.toFixed(1)}%</p>
        <div className="flex items-center text-xs text-amber-600/70 mt-1">
          <span className={`inline-block mr-1 ${(summaryData.avgROI - 7) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(summaryData.avgROI - 7) > 0 ? '+' : ''}{(summaryData.avgROI - 7).toFixed(1)}%
          </span> 
          vs inversión alternativa
        </div>
      </div>
    </div>
  );
};
