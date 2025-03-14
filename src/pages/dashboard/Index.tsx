
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, Home, BarChart3, CalendarClock, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';
import useDashboardMetrics from '@/hooks/useDashboardMetrics';

const COLORS = ['#4F46E5', '#14B8A6', '#F97066'];

const Dashboard = () => {
  const { metrics, isLoading, error } = useDashboardMetrics();
  
  const salesMetrics = {
    leads: metrics?.leads || 0,
    prospectos: metrics?.prospectos || 0,
    cotizaciones: metrics?.cotizaciones || 0,
    ventas: metrics?.ventas || 0
  };
  
  const desarrollos = metrics?.desarrollos || [];
  const salesData = metrics?.salesData || [];
  const inventoryData = metrics?.inventoryData || [];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-600">Visualiza las métricas clave de ventas e inventario.</p>
        </div>
      
        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Total de Leads</CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-600 flex justify-between items-center">
                {isLoading ? (
                  <div className="h-8 w-16 bg-indigo-100 animate-pulse rounded"></div>
                ) : (
                  salesMetrics.leads
                )}
                <Users className="h-5 w-5 text-indigo-400" />
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <p className="text-xs text-green-600">↑ 12% último mes</p>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Prospectos Activos</CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-600 flex justify-between items-center">
                {isLoading ? (
                  <div className="h-8 w-16 bg-indigo-100 animate-pulse rounded"></div>
                ) : (
                  salesMetrics.prospectos
                )}
                <Users className="h-5 w-5 text-indigo-400" />
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <p className="text-xs text-green-600">↑ 8% último mes</p>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Cotizaciones Enviadas</CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-600 flex justify-between items-center">
                {isLoading ? (
                  <div className="h-8 w-16 bg-indigo-100 animate-pulse rounded"></div>
                ) : (
                  salesMetrics.cotizaciones
                )}
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <p className="text-xs text-green-600">↑ 5% último mes</p>
            </CardFooter>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Ventas Cerradas</CardDescription>
              <CardTitle className="text-2xl font-bold text-teal-600 flex justify-between items-center">
                {isLoading ? (
                  <div className="h-8 w-16 bg-teal-100 animate-pulse rounded"></div>
                ) : (
                  salesMetrics.ventas
                )}
                <TrendingUp className="h-5 w-5 text-teal-400" />
              </CardTitle>
            </CardHeader>
            <CardFooter className="pt-2">
              <p className="text-xs text-green-600">↑ 15% último mes</p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Gráficas */}
        <Tabs defaultValue="ventas" className="pt-4">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ventas">Ventas</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="proyecciones">Proyecciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ventas" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Ventas por mes</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ventas" fill="#4F46E5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="inventario" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Estado del inventario</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="proyecciones" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Proyecciones financieras</h3>
            <p className="text-slate-600">
              Próximamente: Visualización de proyecciones de ventas y rendimiento de inversiones.
            </p>
          </TabsContent>
        </Tabs>
        
        {/* Desarrollos destacados */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4">Desarrollos destacados</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[250px] bg-slate-100 animate-pulse rounded-xl" />
              ))
            ) : (
              desarrollos.slice(0, 3).map((desarrollo) => (
                <Card key={desarrollo.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{desarrollo.nombre}</CardTitle>
                    <CardDescription>{desarrollo.ubicacion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Unidades:</span>
                        <span className="text-sm font-medium">{desarrollo.unidades_disponibles}/{desarrollo.total_unidades} disponibles</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Ventas:</span>
                        <span className="text-sm font-medium">{desarrollo.total_unidades - desarrollo.unidades_disponibles} unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Avance:</span>
                        <span className="text-sm font-medium">{desarrollo.avance_porcentaje || '0'}%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link to={`/dashboard/desarrollos/${desarrollo.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                      Ver detalles →
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
