
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, HelpCircle, FileText } from 'lucide-react';
import { BarChart, LineChart, PieChart } from '@/components/ui/chart';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import { supabase } from '@/integrations/supabase/client';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';

// Formatter para moneda
const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const ProyeccionesPage = () => {
  const navigate = useNavigate();
  const { desarrollos = [], isLoading: isLoadingDesarrollos } = useDesarrollos();
  
  const [selectedDesarrolloId, setSelectedDesarrolloId] = useState<string>('');
  const [selectedPrototipoId, setSelectedPrototipoId] = useState<string>('');
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<any>(null);
  const [adrBase, setAdrBase] = useState<number>(1800);
  const [ocupacion, setOcupacion] = useState<number>(70);
  
  // Fetch prototipos based on the selected desarrollo
  const { prototipos = [], isLoading: isLoadingPrototipos } = usePrototipos({
    desarrolloId: selectedDesarrolloId,
  });
  
  // When a desarrollo is selected, fetch its specific financial parameters
  useEffect(() => {
    if (selectedDesarrolloId) {
      const fetchDesarrolloParams = async () => {
        const { data, error } = await supabase
          .from('desarrollos')
          .select('*')
          .eq('id', selectedDesarrolloId)
          .single();
          
        if (error) {
          console.error('Error fetching desarrollo parameters:', error);
          return;
        }
        
        if (data) {
          setSelectedDesarrollo(data);
          // Set ADR and ocupación from the desarrollo if available
          if (data.adr_base) {
            setAdrBase(data.adr_base);
          }
          if (data.ocupacion_anual) {
            setOcupacion(data.ocupacion_anual);
          }
        }
      };
      
      fetchDesarrolloParams();
    } else {
      setSelectedDesarrollo(null);
      // Reset to default values if no desarrollo is selected
      setAdrBase(1800);
      setOcupacion(70);
    }
  }, [selectedDesarrolloId]);
  
  // Variables for calculation
  const [valorPropiedad, setValorPropiedad] = useState<number>(5000000);
  // No longer needed since we're removing the anticipo control
  // const [porcentajeAnticipo, setPorcentajeAnticipo] = useState<number>(30);
  const [plazoInversion, setPlazoInversion] = useState<number>(5);
  
  // Calculate ROI and projection data
  const calculateROI = () => {
    if (!valorPropiedad) return 0;
    
    // Ingresos anuales por renta (ADR * Ocupación * 365)
    const ingresosAnuales = adrBase * (ocupacion / 100) * 365;
    
    // Gastos operativos (estimación: 40% de ingresos)
    const gastosOperativos = ingresosAnuales * 0.4;
    
    // Ingreso neto anual
    const ingresoNetoAnual = ingresosAnuales - gastosOperativos;
    
    // ROI (ingreso neto / valor propiedad)
    const roi = (ingresoNetoAnual / valorPropiedad) * 100;
    
    return roi.toFixed(2);
  };

  // Data for charts
  const roiData = [
    {
      category: 'Inversión Inmobiliaria',
      value: parseFloat(calculateROI())
    },
    {
      category: 'Plazo Fijo Bancario',
      value: 4.5
    },
    {
      category: 'Bolsa de Valores (Promedio)',
      value: 7
    }
  ];
  
  const generarDatosProyeccion = () => {
    // Generamos datos para los próximos años basándonos en la duración elegida
    const años = Array.from({ length: plazoInversion }, (_, i) => i + 1);
    
    // Ingresos anuales iniciales
    const ingresosIniciales = adrBase * (ocupacion / 100) * 365;
    
    // Apreciación anual estimada de la propiedad (5%)
    const apreciacionAnual = 0.05;
    
    // Tasa de crecimiento del ADR (3%)
    const crecimientoADR = 0.03;
    
    return años.map(año => {
      // Valor de la propiedad con apreciación
      const valorPropiedadAño = valorPropiedad * Math.pow(1 + apreciacionAnual, año);
      
      // ADR con crecimiento
      const adrAño = adrBase * Math.pow(1 + crecimientoADR, año);
      
      // Ingresos por renta anuales
      const ingresosRenta = adrAño * (ocupacion / 100) * 365;
      
      // Retorno acumulado
      const retornoAcumulado = (ingresosRenta * año * 0.6) / valorPropiedad * 100;
      
      return {
        año: `Año ${año}`,
        valorPropiedad: valorPropiedadAño,
        ingresos: ingresosRenta,
        retornoAcumulado: retornoAcumulado
      };
    });
  };
  
  const proyeccionData = generarDatosProyeccion();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Analiza el rendimiento y valorización de tus propiedades</p>
          </div>
          
          <div>
            <ExportPDFButton 
              elementId="proyeccion-container" 
              fileName="Proyeccion_Financiera"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6" id="proyeccion-container">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la proyección</CardTitle>
              <CardDescription>
                Ajusta los parámetros para calcular el rendimiento proyectado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desarrollo">Desarrollo</Label>
                    <Select
                      value={selectedDesarrolloId}
                      onValueChange={(value) => {
                        setSelectedDesarrolloId(value);
                        setSelectedPrototipoId('');
                      }}
                    >
                      <SelectTrigger id="desarrollo">
                        <SelectValue placeholder="Selecciona un desarrollo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Sin desarrollo específico --</SelectItem>
                        {desarrollos.map((desarrollo) => (
                          <SelectItem key={desarrollo.id} value={desarrollo.id}>
                            {desarrollo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="prototipo">Prototipo</Label>
                    <Select
                      value={selectedPrototipoId}
                      onValueChange={(value) => {
                        setSelectedPrototipoId(value);
                        if (value) {
                          const prototipo = prototipos.find(p => p.id === value);
                          if (prototipo) {
                            setValorPropiedad(prototipo.precio);
                          }
                        }
                      }}
                      disabled={!selectedDesarrolloId || isLoadingPrototipos}
                    >
                      <SelectTrigger id="prototipo">
                        <SelectValue placeholder={isLoadingPrototipos ? "Cargando..." : "Selecciona un prototipo"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Sin prototipo específico --</SelectItem>
                        {prototipos.map((prototipo) => (
                          <SelectItem key={prototipo.id} value={prototipo.id}>
                            {prototipo.nombre} - {formatter.format(prototipo.precio)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="valorPropiedad">Valor de la propiedad</Label>
                      <span className="text-sm font-medium">{formatter.format(valorPropiedad)}</span>
                    </div>
                    <Slider
                      id="valorPropiedad"
                      min={1000000}
                      max={50000000}
                      step={500000}
                      value={[valorPropiedad]}
                      onValueChange={(value) => setValorPropiedad(value[0])}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>$1,000,000</span>
                      <span>$50,000,000</span>
                    </div>
                  </div>
                  
                  {/* Removed Anticipo slider as requested */}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="plazoProyeccion">Plazo de proyección</Label>
                      <span className="text-sm font-medium">{plazoInversion} años</span>
                    </div>
                    <Slider
                      id="plazoProyeccion"
                      min={1}
                      max={30}
                      step={1}
                      value={[plazoInversion]}
                      onValueChange={(value) => setPlazoInversion(value[0])}
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>1 año</span>
                      <span>30 años</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="adrPromedio">
                      <div className="flex items-center">
                        <span>ADR Promedio</span>
                        <HelpCircle className="ml-1 h-4 w-4 text-slate-400" />
                      </div>
                    </Label>
                    <span className="text-sm font-medium">${adrBase}</span>
                  </div>
                  <Slider
                    id="adrPromedio"
                    min={500}
                    max={10000}
                    step={100}
                    value={[adrBase]}
                    onValueChange={(value) => setAdrBase(value[0])}
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>$500</span>
                    <span>$10,000</span>
                  </div>
                  <p className="text-xs text-slate-500">Tarifa diaria promedio en temporada alta</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="ocupacionAnual">
                      <div className="flex items-center">
                        <span>Ocupación anual</span>
                        <HelpCircle className="ml-1 h-4 w-4 text-slate-400" />
                      </div>
                    </Label>
                    <span className="text-sm font-medium">{ocupacion}%</span>
                  </div>
                  <Slider
                    id="ocupacionAnual"
                    min={10}
                    max={100}
                    step={5}
                    value={[ocupacion]}
                    onValueChange={(value) => setOcupacion(value[0])}
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                  <p className="text-xs text-slate-500">Porcentaje de ocupación promedio anual</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">ROI Anual</CardTitle>
                <CardDescription>Retorno sobre inversión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">{calculateROI()}%</div>
                <p className="text-sm text-slate-500 mb-4">
                  Basado en los ingresos netos proyectados versus la inversión total
                </p>
                
                <div className="h-48">
                  <BarChart 
                    data={roiData}
                    index="category"
                    categories={["value"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value}%`}
                    layout="vertical"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Proyección de valorización</CardTitle>
                <CardDescription>Crecimiento proyectado a {plazoInversion} años</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <LineChart 
                    data={proyeccionData}
                    index="año"
                    categories={["valorPropiedad"]}
                    colors={["blue"]}
                    valueFormatter={(value) => formatter.format(value)}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Proyección de ingresos y gastos</CardTitle>
              <CardDescription>
                Desglose financiero proyectado para los próximos {plazoInversion} años
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">Periodo</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Valor de propiedad</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Ingresos anuales</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Gastos operativos</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">Ingreso neto</th>
                      <th className="text-right py-3 px-4 font-medium text-slate-500">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyeccionData.map((data, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{data.año}</td>
                        <td className="text-right py-3 px-4">{formatter.format(data.valorPropiedad)}</td>
                        <td className="text-right py-3 px-4">{formatter.format(data.ingresos)}</td>
                        <td className="text-right py-3 px-4">{formatter.format(data.ingresos * 0.4)}</td>
                        <td className="text-right py-3 px-4">{formatter.format(data.ingresos * 0.6)}</td>
                        <td className="text-right py-3 px-4 font-medium text-green-600">
                          {((data.ingresos * 0.6 / data.valorPropiedad) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => alert('Esta función estará disponible próximamente')}
                  className="min-w-[200px]"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generar reporte detallado
                </Button>
                <p className="text-sm text-slate-500 mt-2">
                  Obtén un análisis completo con más métricas y escenarios
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Comparación de escenarios</CardTitle>
              <CardDescription>
                Análisis de diferentes escenarios de inversión y rentabilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Escenario Conservador</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ocupación:</span>
                        <span className="font-medium">{Math.max(40, ocupacion - 20)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ADR:</span>
                        <span className="font-medium">${Math.floor(adrBase * 0.8)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ROI Anual:</span>
                        <span className="font-medium text-amber-600">
                          {(parseFloat(calculateROI()) * 0.7).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg border-2 border-green-100">
                    <h3 className="font-medium mb-2">Escenario Base</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ocupación:</span>
                        <span className="font-medium">{ocupacion}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ADR:</span>
                        <span className="font-medium">${adrBase}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ROI Anual:</span>
                        <span className="font-medium text-green-600">{calculateROI()}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-medium mb-2">Escenario Optimista</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ocupación:</span>
                        <span className="font-medium">{Math.min(90, ocupacion + 15)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ADR:</span>
                        <span className="font-medium">${Math.floor(adrBase * 1.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ROI Anual:</span>
                        <span className="font-medium text-blue-600">
                          {(parseFloat(calculateROI()) * 1.3).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="font-medium mb-4">Retorno acumulado proyectado</h3>
                <div className="h-64">
                  <LineChart 
                    data={proyeccionData}
                    index="año"
                    categories={["retornoAcumulado"]}
                    colors={["green"]}
                    valueFormatter={(value) => `${value.toFixed(1)}%`}
                    showLegend={false}
                  />
                </div>
                <p className="text-sm text-slate-500 mt-2 text-center">
                  Porcentaje de retorno acumulado sobre la inversión inicial a lo largo del tiempo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
