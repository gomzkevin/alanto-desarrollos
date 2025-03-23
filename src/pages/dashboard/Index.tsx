
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Subtitle, Title } from '@tremor/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeIcon, ArrowUpRight, DollarSign, Users, Building2, CalendarCheck } from 'lucide-react';
import { Metric, AreaChart } from '@tremor/react';
import useDashboardMetrics from '@/hooks/useDashboardMetrics';
import useUserRole from '@/hooks/useUserRole';
import useChartData from '@/hooks/useChartData';
import SubscriptionBanner from '@/components/dashboard/configuracion/SubscriptionBanner';

const DashboardPage = () => {
  const { metrics, isLoading } = useDashboardMetrics();
  const { userName } = useUserRole();
  const chartData = useChartData();

  // Extract stats from metrics
  const totalDesarrollos = metrics?.desarrollos?.length || 0;
  const totalLeads = metrics?.leads || 0;
  const totalVentas = metrics?.ventas || 0;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2 mb-6">
          <Title>Bienvenido, {userName || 'Usuario'}</Title>
          <Subtitle>Aquí tienes un resumen de tu actividad reciente.</Subtitle>
        </div>
        
        {/* Banner de suscripción */}
        <SubscriptionBanner />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 mr-2 text-indigo-500" />
                  Desarrollos
                </span>
                <ArrowUpRight className="h-4 w-4 text-indigo-500" />
              </CardTitle>
              <CardDescription>Total de desarrollos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-slate-200 rounded w-1/2"></div>
              ) : (
                <Metric>{totalDesarrollos}</Metric>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 mr-2 text-indigo-500" />
                  Leads
                </span>
                <ArrowUpRight className="h-4 w-4 text-indigo-500" />
              </CardTitle>
              <CardDescription>Total de leads registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-slate-200 rounded w-1/2"></div>
              ) : (
                <Metric>{totalLeads}</Metric>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 mr-2 text-indigo-500" />
                  Ventas
                </span>
                <ArrowUpRight className="h-4 w-4 text-indigo-500" />
              </CardTitle>
              <CardDescription>Valor total de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse h-8 bg-slate-200 rounded w-1/2"></div>
              ) : (
                <Metric>${totalVentas?.toLocaleString() || 0}</Metric>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 mr-2 text-indigo-500" />
                Ventas Mensuales
              </span>
              <ArrowUpRight className="h-4 w-4 text-indigo-500" />
            </CardTitle>
            <CardDescription>Ventas mensuales de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-64 bg-slate-200 rounded"></div>
            ) : (
              <AreaChart
                className="mt-4"
                data={metrics?.salesData || []}
                index="name"
                categories={['ventas']}
                colors={['indigo']}
                showAnimation={true}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
