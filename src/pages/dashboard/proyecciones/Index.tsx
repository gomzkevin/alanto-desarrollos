import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useChartData } from '@/hooks';
import { ProyeccionView } from './components/ProyeccionView';
import { toast } from "sonner";
import { FeatureGate } from '@/components/common/FeatureGate';

export const ProyeccionesPage = () => {
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('global');
  const [selectedPrototipoId, setSelectedPrototipoId] = useState<string>('global');
  const [rawChartData, setRawChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    propertyValue: 3500000,
    airbnbProfit: 5655683,
    altReturn: 677006,
    avgROI: 56.8
  });
  const [shouldCalculate, setShouldCalculate] = useState(false);
  
  // Usamos el hook para procesar los datos
  const chartData = useChartData(rawChartData);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDesarrolloChange = (value: string) => {
    setSelectedDesarrolloId(value);
    setSelectedPrototipoId('global');
  };

  const handlePrototipoChange = (value: string) => {
    setSelectedPrototipoId(value);
  };

  const handleChartDataUpdate = (data: any[]) => {
    console.log("Raw chart data received:", JSON.stringify(data.slice(0, 2), null, 2));
    setRawChartData(data);
    
    if (data.length > 0) {
      const lastYear = data[data.length - 1];
      const sumROI = data.reduce((acc, item) => acc + parseFloat(item.yearlyROI), 0);
      
      setSummaryData({
        propertyValue: data[0].initialPropertyValue || 3500000,
        airbnbProfit: lastYear.airbnbProfit - data[0].initialPropertyValue,
        altReturn: lastYear.alternativeInvestment - data[0].initialPropertyValue,
        avgROI: sumROI / data.length
      });
      
      toast.success("Proyección actualizada correctamente");
    }
  };

  const handleCreateProjection = () => {
    setShouldCalculate(true);
  };

  useEffect(() => {
    if (shouldCalculate && rawChartData.length > 0) {
      setShouldCalculate(false);
    }
  }, [rawChartData, shouldCalculate]);

  const getFileName = () => {
    return `Proyeccion_${selectedDesarrolloId !== "global" ? selectedDesarrolloId : 'Global'}_${selectedPrototipoId !== "global" ? selectedPrototipoId : 'Todos'}`;
  };

  return (
    <DashboardLayout>
      <FeatureGate feature="analytics_avanzado" mode="overlay">
        <div className="space-y-6 p-6 pb-16 bg-gradient-to-br from-white to-slate-50" ref={contentRef} id="proyeccion-content">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-indigo-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
          </div>

          <ProyeccionView 
            selectedDesarrolloId={selectedDesarrolloId}
            selectedPrototipoId={selectedPrototipoId}
            onDesarrolloChange={handleDesarrolloChange}
            onPrototipoChange={handlePrototipoChange}
            chartData={chartData}
            summaryData={summaryData}
            onDataUpdate={handleChartDataUpdate}
            shouldCalculate={shouldCalculate}
            onCreateProjection={handleCreateProjection}
            fileName={getFileName()}
          />
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
