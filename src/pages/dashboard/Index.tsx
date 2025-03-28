
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, TooltipProps } from 'recharts';
import { Building2, Users, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Link } from 'react-router-dom';
import useDashboardMetrics from '@/hooks/useDashboardMetrics';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import useDesarrolloStats from '@/hooks/useDesarrolloStats';

// Tooltip formatter for the charts
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name === 'ingresos' ? `Ingresos: ${formatCurrency(entry.value)}` : `${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#4F46E5', '#14B8A6', '#F97066'];

// Interface para extender un desarrollo con sus estadísticas
interface DesarrolloWithStats {
  id: string;
  nombre: string;
  ubicacion: string;
  unidades_disponibles: number;
  total_unidades: number;
  avance_porcentaje: number;
  [key: string]: any;
}

const Dashboard = () => {
  const { metrics, isLoading, error, refetch } = useDashboardMetrics();
  const [desarrollosWithStats, setDesarrollosWithStats] = useState<DesarrolloWithStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  const salesMetrics = {
    leads: metrics?.leads || 0,
    prospectos: metrics?.prospectos || 0,
    cotizaciones: metrics?.cotizaciones || 0,
    ventas: metrics?.ventas || 0
  };
  
  const desarrollos = metrics?.desarrollos || [];
  const salesData = metrics?.salesData || [];
  const inventoryData = metrics?.inventoryData || [];

  const hasError = error !== null;

  // Cargar estadísticas actualizadas para cada desarrollo
  useEffect(() => {
    const loadDesarrolloStats = async () => {
      if (!desarrollos.length) return;
      
      setIsLoadingStats(true);
      
      try {
        const desarrollosWithUpdatedStats = await Promise.all(
          desarrollos.map(async (desarrollo) => {
            try {
              const { data: stats } = await useDesarrolloStats(desarrollo.id);
              
              return {
                ...desarrollo,
                unidades_disponibles: stats?.unidadesDisponibles || desarrollo.unidades_disponibles || 0,
                total_unidades: stats?.totalUnidades || desarrollo.total_unidades || 0,
                avance_porcentaje: stats?.avanceComercial || desarrollo.avance_porcentaje || 0
              };
            } catch (err) {
              console.error(`Error al cargar stats para desarrollo ${desarrollo.id}:`, err);
              // Devolver el desarrollo original si hay un error al obtener las estadísticas
              return desarrollo;
            }
          })
        );
        
        console.log("Desarrollos con estadísticas actualizadas:", desarrollosWithUpdatedStats);
        setDesarrollosWithStats(desarrollosWithUpdatedStats);
      } catch (error) {
        console.error('Error cargando estadísticas de desarrollos:', error);
        // En caso de error, usar los desarrollos originales
        setDesarrollosWithStats(desarrollos);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    loadDesarrolloStats();
  }, [desarrollos]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-600">Visualiza las métricas clave de ventas e inventario.</p>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            Actualizar
          </Button>
        </div>
      
        {hasError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-3 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error al cargar los datos del dashboard</p>
                <p className="text-sm">Por favor intenta de nuevo más tarde o contacta a soporte.</p>
              </div>
            </CardContent>
          </Card>
        )}
      
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
              <Link to="/dashboard/leads" className="text-xs text-indigo-600 hover:underline">
                Ver todos los leads →
              </Link>
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
              <Link to="/dashboard/leads?status=convertido" className="text-xs text-indigo-600 hover:underline">
                Ver prospectos activos →
              </Link>
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
              <Link to="/dashboard/cotizaciones" className="text-xs text-indigo-600 hover:underline">
                Ver cotizaciones →
              </Link>
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
              <Link to="/dashboard/ventas" className="text-xs text-teal-600 hover:underline">
                Ver ventas →
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Gráficas */}
        <Tabs defaultValue="ventas" className="pt-4">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="ventas">Ingresos</TabsTrigger>
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="proyecciones">Proyecciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ventas" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Ingresos por mes</h3>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => value.toLocaleString('es-MX', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      })}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="inventario" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Estado del inventario</h3>
            <div className="h-80">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
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
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="proyecciones" className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Proyecciones financieras</h3>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Link to="/dashboard/proyecciones">
                <Button>Ver proyecciones</Button>
              </Link>
              <p className="text-slate-600 mt-4">
                Accede a la sección de proyecciones para visualizar proyecciones financieras detalladas.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Desarrollos destacados */}
        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Desarrollos destacados</h3>
            <Link to="/dashboard/desarrollos" className="text-sm text-indigo-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading || isLoadingStats ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[250px] bg-slate-100 animate-pulse rounded-xl" />
              ))
            ) : desarrollos.length === 0 ? (
              <div className="col-span-3 py-12 text-center">
                <p className="text-slate-500 mb-4">No hay desarrollos disponibles.</p>
                <Link to="/dashboard/desarrollos/nuevo">
                  <Button>Crear desarrollo</Button>
                </Link>
              </div>
            ) : (
              // Usamos los desarrollos originales si no hay datos en desarrollosWithStats
              (desarrollosWithStats.length > 0 ? desarrollosWithStats : desarrollos).map((desarrollo) => (
                <Card key={desarrollo.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{desarrollo.nombre}</CardTitle>
                    <CardDescription>{desarrollo.ubicacion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Unidades:</span>
                        <span className="text-sm font-medium">
                          {desarrollo.unidades_disponibles}/{desarrollo.total_unidades} disponibles
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Ventas:</span>
                        <span className="text-sm font-medium">
                          {desarrollo.total_unidades - desarrollo.unidades_disponibles} unidades
                        </span>
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
