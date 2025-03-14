
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart, LineChart } from 'lucide-react';

export const ProyeccionesPage = () => {
  const [activeTab, setActiveTab] = useState('ocupacion');

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones</h1>
            <p className="text-slate-600">Análisis financiero y proyecciones de tus inversiones</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Panel de Proyecciones</CardTitle>
            <CardDescription>
              Visualiza el rendimiento proyectado de tus inversiones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="ocupacion" className="space-y-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="ocupacion" className="flex items-center">
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Ocupación</span>
                </TabsTrigger>
                <TabsTrigger value="financiero" className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  <span>Financiero</span>
                </TabsTrigger>
                <TabsTrigger value="comparativo" className="flex items-center">
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Comparativo</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="ocupacion">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Proyección de Ocupación</h3>
                  <p className="text-sm text-slate-500">
                    Esta sección muestra la proyección de ocupación de tus propiedades.
                  </p>
                  <div className="h-[300px] bg-slate-100 rounded-md flex items-center justify-center">
                    <p className="text-slate-500">Gráfico de proyección de ocupación en desarrollo</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="financiero">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Proyección Financiera</h3>
                  <p className="text-sm text-slate-500">
                    Esta sección muestra la proyección financiera de tus inversiones.
                  </p>
                  <div className="h-[300px] bg-slate-100 rounded-md flex items-center justify-center">
                    <p className="text-slate-500">Gráfico de proyección financiera en desarrollo</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="comparativo">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Análisis Comparativo</h3>
                  <p className="text-sm text-slate-500">
                    Esta sección muestra un análisis comparativo entre diferentes propiedades o inversiones.
                  </p>
                  <div className="h-[300px] bg-slate-100 rounded-md flex items-center justify-center">
                    <p className="text-slate-500">Gráfico comparativo en desarrollo</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-6" />
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline">Exportar datos</Button>
              <Button>Generar reporte</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
