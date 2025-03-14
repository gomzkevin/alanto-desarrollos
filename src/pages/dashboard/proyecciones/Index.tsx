import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart as LucideLineChart } from 'lucide-react'; // Rename to avoid confusion
import { LineChart } from '@/components/ui/chart'; // Import from our chart components
import { Calculator } from '@/components/Calculator';
import useDesarrollos from '@/hooks/useDesarrollos';
import { formatCurrency } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';

export const ProyeccionesPage = () => {
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  const { desarrollos = [], isLoading } = useDesarrollos();
  const [chartData, setChartData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState({
    airbnbReturn: 5655683,
    altReturn: 677006,
    avgROI: 56.8
  });
  const [activeTab, setActiveTab] = useState('grafica');

  const handleChartDataUpdate = (data: any[]) => {
    setChartData(data);
    
    if (data.length > 0) {
      const lastYear = data[data.length - 1];
      const sumROI = data.reduce((acc, item) => acc + parseFloat(item.yearlyROI), 0);
      
      setSummaryData({
        airbnbReturn: lastYear.airbnbProfit,
        altReturn: lastYear.alternativeInvestment,
        avgROI: sumROI / data.length
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
          </div>
          
          <div className="w-full sm:w-72">
            <Select
              value={selectedDesarrolloId}
              onValueChange={setSelectedDesarrolloId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Configuración global (por defecto)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Configuración global (por defecto)</SelectItem>
                {desarrollos.map((desarrollo) => (
                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                    {desarrollo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              {selectedDesarrolloId 
                ? "Usando configuración específica de desarrollo" 
                : "Usando configuración global"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de proyección</CardTitle>
              <CardDescription>
                Ajusta los valores para personalizar el análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calculator 
                desarrolloId={selectedDesarrolloId} 
                onDataUpdate={handleChartDataUpdate} 
              />
            </CardContent>
          </Card>

          <Card>
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
                      <LineChart 
                        data={chartData}
                        index="year"
                        categories={["airbnbProfit", "alternativeInvestment"]}
                        colors={["indigo", "teal"]}
                        valueFormatter={(value) => formatCurrency(value)}
                        showLegend={true}
                        showXAxis={true}
                        showYAxis={true}
                        yAxisWidth={80}
                        showAnimation={true}
                        curveType="monotone"
                        showTooltip={true}
                        className="h-[400px]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-slate-500">
                      Ajusta los parámetros para generar una proyección
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="tabla" className="px-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-slate-200">
                          <TableHead className="text-left font-medium text-slate-700">AÑO</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">RETORNO AIRBNB</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">RETORNO INVERSIÓN ALT.</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">DIFERENCIA</TableHead>
                          <TableHead className="text-left font-medium text-slate-700">ROI ANUAL</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chartData.length > 0 ? (
                          chartData.map((item) => (
                            <TableRow key={item.year} className="border-b border-slate-100 hover:bg-slate-50">
                              <TableCell>{item.year}</TableCell>
                              <TableCell>{formatCurrency(item.airbnbProfit)}</TableCell>
                              <TableCell>{formatCurrency(item.alternativeInvestment)}</TableCell>
                              <TableCell>{formatCurrency(item.difference)}</TableCell>
                              <TableCell>{item.yearlyROI}%</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                              No hay datos disponibles. Ajusta los parámetros para generar una proyección.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0 mt-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">Retorno total (Airbnb)</p>
                  <p className="text-xl font-bold text-indigo-700 mt-1">{formatCurrency(summaryData.airbnbReturn)}</p>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-teal-600 font-medium">Retorno alternativo</p>
                  <p className="text-xl font-bold text-teal-700 mt-1">{formatCurrency(summaryData.altReturn)}</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">ROI anual promedio</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{summaryData.avgROI.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex justify-end p-6 pt-0">
                <ExportPDFButton
                  buttonText="Exportar PDF"
                  resourceName="proyeccion"
                  fileName={`Proyeccion_${selectedDesarrolloId || 'Global'}`}
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
