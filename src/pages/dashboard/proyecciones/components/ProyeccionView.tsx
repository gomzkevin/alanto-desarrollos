
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ProyeccionFilters } from './ProyeccionFilters';
import { Calculator } from '@/components/Calculator';
import { ProyeccionChart } from './ProyeccionChart';
import { ProyeccionTable } from './ProyeccionTable';
import { ProyeccionSummary } from './ProyeccionSummary';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

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
  fileName
}: ProyeccionViewProps) => {
  const [activeTab, setActiveTab] = useState('grafica');

  return (
    <div className="space-y-6" id="proyeccion-detail-content">
      {/* Header con título y filtros */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Información de la proyección</CardTitle>
            <CardDescription>
              Selecciona desarrollo y prototipo para personalizar la proyección
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
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <ProyeccionFilters
              selectedDesarrolloId={selectedDesarrolloId}
              selectedPrototipoId={selectedPrototipoId}
              onDesarrolloChange={onDesarrolloChange}
              onPrototipoChange={onPrototipoChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sección de Calculadora */}
      <Card>
        <CardHeader>
          <CardTitle>Parámetros de proyección</CardTitle>
          <CardDescription>
            Ajusta los valores para personalizar el cálculo de rendimiento
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

      {/* Sección de Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de la inversión</CardTitle>
          <CardDescription>
            Análisis comparativo de rendimientos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProyeccionSummary summaryData={summaryData} />
        </CardContent>
      </Card>

      {/* Sección de Gráfica y Tabla */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados detallados</CardTitle>
          <CardDescription>
            Visualización año por año de la proyección financiera
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
              <ProyeccionChart chartData={chartData} />
            </TabsContent>
            
            <TabsContent value="tabla" className="px-0">
              <ProyeccionTable chartData={chartData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
