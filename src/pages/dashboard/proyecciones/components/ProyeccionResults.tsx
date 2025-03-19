import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import { ProyeccionChart } from './ProyeccionChart';
import { ProyeccionTable } from './ProyeccionTable';
import { ProyeccionSummary } from './ProyeccionSummary';

interface ProyeccionResultsProps {
  chartData: any[];
  summaryData: {
    propertyValue: number;
    airbnbProfit: number;
    altReturn: number;
    avgROI: number;
  };
  activeTab: string;
  onTabChange: (value: string) => void;
  fileName: string;
}

export const ProyeccionResults = ({
  chartData,
  summaryData,
  activeTab,
  onTabChange,
  fileName
}: ProyeccionResultsProps) => {
  return (
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

        <div className="flex justify-end p-6 pt-0">
          <ExportPDFButton
            cotizacionId="placeholder"
            leadName="Proyección"
            desarrolloNombre="Desarrollo"
            prototipoNombre="Análisis"
            buttonText="Exportar PDF"
            resourceName="proyección"
            fileName={`Proyeccion_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}`}
            className="ml-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};
