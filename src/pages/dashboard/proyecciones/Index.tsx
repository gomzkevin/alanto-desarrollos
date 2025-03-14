
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calculator, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import useDesarrollos from '@/hooks/useDesarrollos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ProyeccionesPage = () => {
  const [propertyValue, setPropertyValue] = useState(3500000);
  const [occupancyRate, setOccupancyRate] = useState(70); // porcentaje
  const [nightlyRate, setNightlyRate] = useState(1800);
  const [years, setYears] = useState(10);
  const [annualGrowth, setAnnualGrowth] = useState(5); // porcentaje
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState('');
  
  // Tasa de inversión alternativa (para comparación)
  const alternativeRate = 7; // porcentaje
  
  const [chartData, setChartData] = useState<any[]>([]);
  const { desarrollos = [], isLoading: isLoadingDesarrollos } = useDesarrollos();
  
  // Formato de valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Cargar configuración del desarrollo seleccionado
  useEffect(() => {
    if (selectedDesarrolloId) {
      const loadDesarrolloConfig = async () => {
        try {
          const { data, error } = await supabase
            .from('desarrollos')
            .select('*')
            .eq('id', selectedDesarrolloId)
            .single();
            
          if (error) {
            console.error('Error al cargar la configuración del desarrollo:', error);
            return;
          }
          
          if (data) {
            // Actualizar los valores con los del desarrollo
            if (data.adr_base) {
              setNightlyRate(data.adr_base);
            }
            if (data.ocupacion_anual) {
              setOccupancyRate(data.ocupacion_anual);
            }
          }
        } catch (error) {
          console.error('Error al cargar la configuración del desarrollo:', error);
        }
      };
      
      loadDesarrolloConfig();
    }
  }, [selectedDesarrolloId]);
  
  // Calcular la proyección
  const calculateProjection = () => {
    // Ya no necesitamos incluir el downPayment en el cálculo
    const annualRevenue = nightlyRate * 365 * (occupancyRate / 100);
    
    // Gastos operativos (estimados en 35% de los ingresos)
    const operatingExpenseRate = 0.35;
    
    let data = [];
    let airbnbCumulativeProfit = 0;
    let alternativeCumulativeProfit = 0;
    
    for (let year = 1; year <= years; year++) {
      // Calcular inversión Airbnb
      const yearlyGrowthFactor = Math.pow(1 + (annualGrowth / 100), year - 1);
      const thisYearRevenue = annualRevenue * yearlyGrowthFactor;
      const thisYearExpenses = thisYearRevenue * operatingExpenseRate;
      const thisYearProfit = thisYearRevenue - thisYearExpenses;
      airbnbCumulativeProfit += thisYearProfit;
      
      // Apreciación de la propiedad (estimada en 4% por año)
      const propertyAppreciation = propertyValue * Math.pow(1.04, year) - propertyValue;
      
      // Calcular inversión alternativa (ej. acciones)
      const alternativeInvestmentReturn = propertyValue * Math.pow(1 + (alternativeRate / 100), year) - propertyValue;
      alternativeCumulativeProfit = alternativeInvestmentReturn;
      
      // ROI anual
      const roi = (thisYearProfit / propertyValue) * 100;
      
      data.push({
        year,
        airbnbProfit: airbnbCumulativeProfit + propertyAppreciation,
        alternativeInvestment: alternativeCumulativeProfit,
        yearlyROI: roi.toFixed(1)
      });
    }
    
    setChartData(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
          <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Parámetros de proyección</CardTitle>
              <CardDescription>Ajusta los valores para personalizar el análisis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selector de desarrollo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Desarrollo
                </label>
                <Select
                  value={selectedDesarrolloId}
                  onValueChange={setSelectedDesarrolloId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar desarrollo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Personalizado</SelectItem>
                    {desarrollos.map((desarrollo) => (
                      <SelectItem key={desarrollo.id} value={desarrollo.id}>
                        {desarrollo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor de la propiedad: {formatCurrency(propertyValue)}
                </label>
                <Slider 
                  defaultValue={[propertyValue]} 
                  max={50000000} 
                  min={1000000} 
                  step={100000}
                  onValueChange={(value) => setPropertyValue(value[0])}
                  className="py-4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Porcentaje de ocupación anual: {occupancyRate}%
                </label>
                <Slider 
                  defaultValue={[occupancyRate]} 
                  max={100} 
                  min={40} 
                  step={1}
                  onValueChange={(value) => setOccupancyRate(value[0])}
                  className="py-4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tarifa promedio por noche (MXN)
                </label>
                <Input 
                  type="number" 
                  value={nightlyRate} 
                  onChange={(e) => setNightlyRate(parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Crecimiento anual: {annualGrowth}%
                </label>
                <Slider 
                  defaultValue={[annualGrowth]} 
                  max={10} 
                  min={0} 
                  step={0.5}
                  onValueChange={(value) => setAnnualGrowth(value[0])}
                  className="py-4"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Años para proyección: {years}
                </label>
                <Slider 
                  defaultValue={[years]} 
                  max={20} 
                  min={5} 
                  step={1}
                  onValueChange={(value) => setYears(value[0])}
                  className="py-4"
                />
              </div>
              
              <Button className="w-full" onClick={calculateProjection}>
                <Calculator className="mr-2 h-4 w-4" />
                Calcular proyección
              </Button>
            </CardContent>
          </Card>
          
          {/* Resultados */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resultados de la proyección</CardTitle>
              <CardDescription>Comparativa de rendimientos a lo largo del tiempo</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grafica">
                <TabsList className="mb-6">
                  <TabsTrigger value="grafica">Gráfica</TabsTrigger>
                  <TabsTrigger value="tabla">Tabla detallada</TabsTrigger>
                </TabsList>
                
                <TabsContent value="grafica" className="space-y-6">
                  {chartData.length > 0 ? (
                    <>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" label={{ value: 'Años', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value).replace('MXN', '')}
                              label={{ value: 'Retorno (MXN)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), 'Retorno']}
                              labelFormatter={(label) => `Año ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="airbnbProfit" 
                              name="Propiedad Airbnb"
                              stroke="#4F46E5" 
                              strokeWidth={3}
                              activeDot={{ r: 8 }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="alternativeInvestment" 
                              name="Inversión Alternativa"
                              stroke="#14B8A6" 
                              strokeWidth={3}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      {/* Resumen */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg">
                          <p className="text-sm text-indigo-600 font-medium">Retorno total (Airbnb)</p>
                          <p className="text-xl font-bold text-indigo-700 mt-1">
                            {formatCurrency(chartData[chartData.length - 1]?.airbnbProfit || 0)}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-teal-50 rounded-lg">
                          <p className="text-sm text-teal-600 font-medium">Retorno alternativo</p>
                          <p className="text-xl font-bold text-teal-700 mt-1">
                            {formatCurrency(chartData[chartData.length - 1]?.alternativeInvestment || 0)}
                          </p>
                        </div>
                        
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <p className="text-sm text-amber-600 font-medium">ROI anual promedio</p>
                          <p className="text-xl font-bold text-amber-700 mt-1">
                            {chartData.length > 0 
                              ? (chartData.reduce((acc, item) => acc + parseFloat(item.yearlyROI), 0) / chartData.length).toFixed(1) 
                              : '0'}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Exportar PDF
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-slate-600">Ajusta los parámetros y haz clic en "Calcular proyección" para ver los resultados</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="tabla">
                  {chartData.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                          <tr>
                            <th className="px-6 py-3">Año</th>
                            <th className="px-6 py-3">Retorno Airbnb</th>
                            <th className="px-6 py-3">Retorno Inversión Alt.</th>
                            <th className="px-6 py-3">Diferencia</th>
                            <th className="px-6 py-3">ROI Anual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chartData.map((row) => (
                            <tr key={row.year} className="bg-white border-b">
                              <td className="px-6 py-4">{row.year}</td>
                              <td className="px-6 py-4">{formatCurrency(row.airbnbProfit)}</td>
                              <td className="px-6 py-4">{formatCurrency(row.alternativeInvestment)}</td>
                              <td className="px-6 py-4">
                                {formatCurrency(row.airbnbProfit - row.alternativeInvestment)}
                              </td>
                              <td className="px-6 py-4">{row.yearlyROI}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-slate-600">Ajusta los parámetros y haz clic en "Calcular proyección" para ver los resultados</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
