import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Building2, Users, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';
import { useOptimizedDashboardMetrics } from '@/hooks/optimized/useDashboardMetrics';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { countDesarrolloUnidadesByStatus } from '@/hooks/unidades/countUtils';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { data: metrics, isLoading, error, refetch } = useOptimizedDashboardMetrics();
  const [desarrollosWithStats, setDesarrollosWithStats] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const salesMetrics = {
    leads: metrics?.leads || 0,
    prospectos: metrics?.prospectos || 0,
    cotizaciones: metrics?.cotizaciones || 0,
    ventas: metrics?.ventas || 0
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    if (!metrics?.desarrollos || metrics.desarrollos.length === 0) {
      return;
    }

    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        const desarrollosWithStatsPromises = metrics.desarrollos.map(async (desarrollo) => {
          try {
            const unidadesData = await countDesarrolloUnidadesByStatus(desarrollo.id);
            const totalUnidades = unidadesData.total || 0;
            const unidadesDisponibles = unidadesData.disponibles || 0;
            const unidadesVendidas = unidadesData.vendidas || 0;
            
            console.log(`Desarrollo ${desarrollo.nombre}:`, {
              totalUnidades,
              unidadesDisponibles,
              unidadesVendidas,
              progreso: desarrollo.avance_porcentaje
            });
            
            return {
              ...desarrollo,
              total_unidades: totalUnidades,
              unidades_disponibles: unidadesDisponibles,
              unidades_vendidas: unidadesVendidas,
              avance_porcentaje: desarrollo.avance_porcentaje
            };
          } catch (error) {
            console.error(`Error fetching stats for desarrollo ${desarrollo.id}:`, error);
            return {
              ...desarrollo,
              total_unidades: 0,
              unidades_disponibles: 0,
              unidades_vendidas: 0,
              avance_porcentaje: desarrollo.avance_porcentaje
            };
          }
        });

        const desarrollosWithStatsResolved = await Promise.all(desarrollosWithStatsPromises);
        setDesarrollosWithStats(desarrollosWithStatsResolved);
      } catch (error) {
        console.error('Error fetching desarrollo stats:', error);
        const desarrollosWithStatsFiltered = metrics.desarrollos.map(desarrollo => ({
          ...desarrollo,
          total_unidades: 0,
          unidades_disponibles: 0,
          unidades_vendidas: 0,
          avance_porcentaje: desarrollo.avance_porcentaje
        }));
        setDesarrollosWithStats(desarrollosWithStatsFiltered);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [metrics?.desarrollos]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el dashboard
            </h3>
            <p className="text-gray-600 mb-6">
              Hubo un problema al cargar los datos. Por favor, intenta de nuevo.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general de tu actividad de ventas
          </p>
        </div>

        {/* Sales Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics.leads}</div>
              <p className="text-xs text-muted-foreground">
                Clientes potenciales
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospectos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics.prospectos}</div>
              <p className="text-xs text-muted-foreground">
                Interesados activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cotizaciones</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics.cotizaciones}</div>
              <p className="text-xs text-muted-foreground">
                Propuestas enviadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesMetrics.ventas}</div>
              <p className="text-xs text-muted-foreground">
                Unidades vendidas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sales">Ingresos</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="projections">Proyecciones</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Mes</CardTitle>
                <CardDescription>
                  Evolución de los ingresos en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={Array.isArray(metrics?.salesData) ? metrics.salesData : []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="ingresos" 
                      fill="currentColor" 
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Inventario</CardTitle>
                <CardDescription>
                  Distribución de unidades por estado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={metrics?.inventoryData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(metrics?.inventoryData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Proyecciones de Ventas</CardTitle>
                <CardDescription>
                  Estimaciones para los próximos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Funcionalidad de proyecciones próximamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Developments */}
        <Card>
          <CardHeader>
            <CardTitle>Desarrollos Recientes</CardTitle>
            <CardDescription>
              Estado actual de tus desarrollos más recientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : desarrollosWithStats.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay desarrollos registrados</p>
                <Button asChild>
                  <Link to="/dashboard/desarrollos">
                    Crear primer desarrollo
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {desarrollosWithStats.slice(0, 3).map((desarrollo) => (
                  <div key={desarrollo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{desarrollo.nombre}</h3>
                      <span className="text-sm text-gray-500">{desarrollo.avance_porcentaje}% completo</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{desarrollo.ubicacion}</p>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total:</span>
                        <div className="text-lg font-bold">{desarrollo.total_unidades || 0}</div>
                      </div>
                      <div>
                        <span className="font-medium">Disponibles:</span>
                        <div className="text-lg font-bold text-green-600">{desarrollo.unidades_disponibles || 0}</div>
                      </div>
                      <div>
                        <span className="font-medium">Vendidas:</span>
                        <div className="text-lg font-bold text-blue-600">{desarrollo.unidades_vendidas || 0}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/dashboard/desarrollos/${desarrollo.id}`}>
                          Ver detalles
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {desarrollosWithStats.length > 3 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link to="/dashboard/desarrollos">
                        Ver todos los desarrollos
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;