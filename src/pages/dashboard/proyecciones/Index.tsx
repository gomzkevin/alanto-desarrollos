
import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from 'lucide-react';
import { Calculator } from '@/components/Calculator';

export const ProyeccionesPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Proyecciones Financieras</h1>
            <p className="text-slate-600">Calcula y compara el rendimiento potencial de inversiones inmobiliarias.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Parámetros de proyección */}
          <Card>
            <CardHeader>
              <CardTitle>Parámetros de proyección</CardTitle>
              <CardDescription>
                Ajusta los valores para personalizar el análisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calculator />
            </CardContent>
          </Card>

          {/* Resultados de la proyección */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados de la proyección</CardTitle>
              <CardDescription>
                Comparativa de rendimientos a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="grafica" className="w-full">
                <div className="px-6 pt-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="grafica">Gráfica</TabsTrigger>
                    <TabsTrigger value="tabla">Tabla detallada</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="grafica" className="p-6">
                  <div className="h-[400px] w-full">
                    {/* El componente Calculator incluye la gráfica */}
                  </div>
                </TabsContent>
                
                <TabsContent value="tabla" className="px-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left p-3 font-medium text-slate-700">AÑO</th>
                          <th className="text-left p-3 font-medium text-slate-700">RETORNO AIRBNB</th>
                          <th className="text-left p-3 font-medium text-slate-700">RETORNO INVERSIÓN ALT.</th>
                          <th className="text-left p-3 font-medium text-slate-700">DIFERENCIA</th>
                          <th className="text-left p-3 font-medium text-slate-700">ROI ANUAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Los datos de la tabla se generarán dinámicamente desde Calculator */}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0 mt-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-sm text-indigo-600 font-medium">Retorno total (Airbnb)</p>
                  <p className="text-xl font-bold text-indigo-700 mt-1">$5,655,683</p>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-teal-600 font-medium">Retorno alternativo</p>
                  <p className="text-xl font-bold text-teal-700 mt-1">$677,006</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">ROI anual promedio</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">56.8%</p>
                </div>
              </div>

              <div className="flex justify-end p-6 pt-0">
                <Button className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProyeccionesPage;
