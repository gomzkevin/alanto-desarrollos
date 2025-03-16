
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProyeccionFilters } from './ProyeccionFilters';
import { Calculator } from '@/components/Calculator';
import { ProyeccionChart } from './ProyeccionChart';
import { ProyeccionTable } from './ProyeccionTable';
import { ProyeccionSummary } from './ProyeccionSummary';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface ProyeccionViewProps {
  selectedDesarrolloId: string;
  selectedPrototipoId: string;
  onDesarrolloChange: (value: string) => void;
  onPrototipoChange: (value: string) => void;
  chartData: any[];
  summaryData: {
    propertyValue: number;
    airbnbProfit: number;
    altReturn: number;
    avgROI: number;
  };
  onDataUpdate: (data: any[]) => void;
  shouldCalculate: boolean;
  onCreateProjection: () => void;
  activeTab: string;
  onTabChange: (value: string) => void;
  fileName: string;
}

export const ProyeccionView = ({
  selectedDesarrolloId,
  selectedPrototipoId,
  onDesarrolloChange,
  onPrototipoChange,
  chartData,
  summaryData,
  onDataUpdate,
  shouldCalculate,
  onCreateProjection,
  activeTab,
  onTabChange,
  fileName
}: ProyeccionViewProps) => {
  return (
    <div className="space-y-6" id="proyeccion-detail-content">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-800">Parámetros de proyección</h2>
          <p className="text-slate-600">Selecciona el desarrollo y prototipo para la proyección</p>
        </div>
        
        <ProyeccionFilters
          selectedDesarrolloId={selectedDesarrolloId}
          selectedPrototipoId={selectedPrototipoId}
          onDesarrolloChange={onDesarrolloChange}
          onPrototipoChange={onPrototipoChange}
        />
      </div>

      {/* Main content container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar with calculator */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Ajusta los parámetros para personalizar la proyección
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calculator 
              desarrolloId={selectedDesarrolloId !== "global" ? selectedDesarrolloId : undefined}
              prototipoId={selectedPrototipoId !== "global" ? selectedPrototipoId : undefined}
              onDataUpdate={onDataUpdate}
              shouldCalculate={shouldCalculate}
            />
            
            <Button 
              onClick={onCreateProjection} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 mt-6"
            >
              Actualizar Proyección
            </Button>
          </CardContent>
        </Card>

        {/* Main content area with results */}
        <div className="lg:col-span-9 space-y-6">
          {/* Results card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Resultados de la proyección</CardTitle>
                <CardDescription>
                  Comparativa de rendimientos a lo largo del tiempo
                </CardDescription>
              </div>
              <ExportPDFButton
                buttonText="Exportar PDF"
                resourceName="proyeccion"
                fileName={fileName}
                elementId="proyeccion-detail-content"
                className="flex items-center gap-2"
                variant="outline"
              />
            </CardHeader>
            <CardContent className="p-0">
              <Tabs 
                defaultValue="grafica" 
                value={activeTab}
                onValueChange={onTabChange}
                className="w-full"
              >
                <div className="px-6 pt-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="grafica">Gráfica</TabsTrigger>
                    <TabsTrigger value="tabla">Tabla detallada</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="grafica" className="p-6">
                  <ProyeccionChart chartData={chartData} />
                </TabsContent>
                
                <TabsContent value="tabla" className="px-0">
                  <ProyeccionTable chartData={chartData} />
                </TabsContent>
              </Tabs>

              <ProyeccionSummary summaryData={summaryData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
