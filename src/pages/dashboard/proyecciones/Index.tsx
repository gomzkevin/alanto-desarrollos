
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ProyeccionFilters } from './components/ProyeccionFilters';
import { ProyeccionCalculator } from './components/ProyeccionCalculator';
import { ProyeccionResults } from './components/ProyeccionResults';
import { useChartData } from '@/hooks';

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
  const [activeTab, setActiveTab] = useState('grafica');
  const [shouldCalculate, setShouldCalculate] = useState(false);
  
  // Usamos el hook para procesar los datos
  const chartData = useChartData(rawChartData);

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
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
          </div>
          
          <ProyeccionFilters
            selectedDesarrolloId={selectedDesarrolloId}
            selectedPrototipoId={selectedPrototipoId}
            onDesarrolloChange={handleDesarrolloChange}
            onPrototipoChange={handlePrototipoChange}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <ProyeccionCalculator
            desarrolloId={selectedDesarrolloId !== "global" ? selectedDesarrolloId : undefined}
            prototipoId={selectedPrototipoId !== "global" ? selectedPrototipoId : undefined}
            onDataUpdate={handleChartDataUpdate}
            shouldCalculate={shouldCalculate}
            onCreateProjection={handleCreateProjection}
          />

          <ProyeccionResults
            chartData={chartData}
            summaryData={summaryData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            fileName={getFileName()}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
