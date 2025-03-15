import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import { BarChart } from '@/components/ui/chart';
import { Calculator } from '@/components/Calculator';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { formatCurrency, formatCurrencyShort } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export const ProyeccionesPage = () => {
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('global');
  const [selectedPrototipoId, setSelectedPrototipoId] = useState<string>('global');
  const { desarrollos = [], isLoading: desarrollosLoading } = useDesarrollos();
  const { prototipos = [], isLoading: prototiposLoading } = usePrototipos({ 
    desarrolloId: selectedDesarrolloId !== 'global' ? selectedDesarrolloId : null
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    propertyValue: 3500000,
    airbnbProfit: 5655683,
    altReturn: 677006,
    avgROI: 56.8
  });
  const [activeTab, setActiveTab] = useState('grafica');
  const [shouldCalculate, setShouldCalculate] = useState(false);

  const handleDesarrolloChange = (value: string) => {
    setSelectedDesarrolloId(value);
    setSelectedPrototipoId('global');
  };

  const handlePrototipoChange = (value: string) => {
    setSelectedPrototipoId(value);
  };

  const handleChartDataUpdate = (data: any[]) => {
    console.log("Raw chart data received:", JSON.stringify(data, null, 2));
    
    const enhancedData = data.map(item => ({
      ...item,
      "year_label": `Año ${item.year}`,
      "Renta vacacional": item.airbnbProfit,
      "Bonos US": item.alternativeInvestment
    }));
    
    console.log("Enhanced chart data:", JSON.stringify(enhancedData, null, 2));
    
    setChartData(enhancedData);
    
    if (enhancedData.length > 0) {
      const lastYear = enhancedData[enhancedData.length - 1];
      const sumROI = enhancedData.reduce((acc, item) => acc + parseFloat(item.yearlyROI), 0);
      
      setSummaryData({
        propertyValue: enhancedData[0].initialPropertyValue || 3500000,
        airbnbProfit: lastYear.airbnbProfit - enhancedData[0].initialPropertyValue,
        altReturn: lastYear.alternativeInvestment - enhancedData[0].initialPropertyValue,
        avgROI: sumROI / enhancedData.length
      });
    }
  };

  const handleCreateProjection = () => {
    setShouldCalculate(true);
  };

  useEffect(() => {
    if (shouldCalculate && chartData.length > 0) {
      setShouldCalculate(false);
    }
  }, [chartData, shouldCalculate]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
          </div>
          
          <div className="space-y-2 flex flex-col sm:items-end">
            <div className="w-full sm:w-72">
              <Select
                value={selectedDesarrolloId}
                onValueChange={handleDesarrolloChange}
              >
                <SelectTrigger className="bg-white border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-indigo-700 shadow-sm">
                  <SelectValue placeholder="Seleccionar desarrollo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-indigo-100 shadow-md">
                  <SelectItem value="global" className="font-medium text-indigo-700">Todos los desarrollos</SelectItem>
                  {desarrollos.map((desarrollo) => (
                    <SelectItem key={desarrollo.id} value={desarrollo.id} className="text-slate-700 hover:text-indigo-600">
                      {desarrollo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-72">
              <Select
                value={selectedPrototipoId}
                onValueChange={handlePrototipoChange}
                disabled={selectedDesarrolloId === 'global'}
              >
                <SelectTrigger className="bg-white border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-all font-medium text-teal-700 shadow-sm">
                  <SelectValue placeholder="Seleccionar prototipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-teal-100 shadow-md">
                  <SelectItem value="global" className="font-medium text-teal-700">Todos los prototipos</SelectItem>
                  {prototipos.map((prototipo) => (
                    <SelectItem key={prototipo.id} value={prototipo.id} className="text-slate-700 hover:text-teal-600">
                      {prototipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {selectedDesarrolloId === 'global' 
                  ? "Selecciona un desarrollo primero" 
                  : selectedPrototipoId !== 'global'
                    ? "Usando configuración específica de prototipo"
                    : "Usando configuración de desarrollo"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card className="xl:col-span-3 xl:max-w-md">
            <CardHeader>
              <CardTitle>Parámetros de proyección</CardTitle>
              <CardDescription>
                Ajusta los valores para personalizar el análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calculator 
                desarrolloId={selectedDesarrolloId !== "global" ? selectedDesarrolloId : undefined}
                prototipoId={selectedPrototipoId !== "global" ? selectedPrototipoId : undefined}
                onDataUpdate={handleChartDataUpdate}
                shouldCalculate={shouldCalculate}
              />
              
              <Button 
                onClick={handleCreateProjection} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
              >
                Crear Proyección
              </Button>
            </CardContent>
          </Card>

          <Card className="xl:col-span-9">
            <CardHeader>
              <CardTitle>Resultados de la proyección</CardTitle>
              <CardDescription>
                Comparativa de rendimientos a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs 
                defaultValue="grafica" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="px-6 pt-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="grafica">Gráfica</TabsTrigger>
                    <TabsTrigger value="tabla">Tabla detallada</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="grafica" className="p-6">
                  {chartData.length > 0 ? (
                    <div className="h-[400px] w-full">
                      <BarChart 
                        data={chartData}
                        index="year_label"
                        categories={["Renta vacacional", "Bonos US"]}
                        colors={["#9b87f5", "#7E69AB"]}
                        valueFormatter={(value) => formatCurrencyShort(value)}
                        showLegend={true}
                        showXAxis={true}
                        showYAxis={true}
                        yAxisWidth={60}
                        showAnimation={true}
                        showTooltip={true}
                        className="h-[400px] text-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-slate-500">
                      Haz clic en "Crear Proyección" para generar el análisis
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="tabla" className="px-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-slate-200">
                          <TableHead className="text-left font-medium text-slate-700">AÑO</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">RENTA VACACIONAL</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">BONOS US</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">DIFERENCIA</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">ROI ANUAL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.length > 0 ? (
                          chartData.map((item) => (
                            <TableRow key={item.year} className="border-b border-slate-100 hover:bg-slate-50">
                              <TableCell>{`Año ${item.year}`}</TableCell>
                              <TableCell>{formatCurrency(item.airbnbProfit)}</TableCell>
                              <TableCell>{formatCurrency(item.alternativeInvestment)}</TableCell>
                              <TableCell>{formatCurrency(item.difference)}</TableCell>
                              <TableCell>{item.yearlyROI}%</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                              Haz clic en "Crear Proyección" para generar el análisis.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

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

              <div className="flex justify-end p-6 pt-0">
                <ExportPDFButton
                  buttonText="Exportar PDF"
                  resourceName="proyeccion"
                  fileName={`Proyeccion_${selectedDesarrolloId !== "global" ? selectedDesarrolloId : 'Global'}_${selectedPrototipoId !== "global" ? selectedPrototipoId : 'Todos'}`}
                  className="flex items-center gap-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
