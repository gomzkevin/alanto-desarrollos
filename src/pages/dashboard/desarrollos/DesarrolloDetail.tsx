import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, PlusIcon, Building2, Users, AreaChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import AdminResourceDialog from '@/components/dashboard/ResourceDialog/AdminResourceDialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import useDesarrollos from '@/hooks/useDesarrollos';
import usePrototipos from '@/hooks/usePrototipos';
import PrototipoCard from '@/components/dashboard/PrototipoCard';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import useDesarrolloStats from '@/hooks/useDesarrolloStats';
import DesarrolloEditButton from '@/components/dashboard/DesarrolloEditButton';
import useDesarrolloImagenes from '@/hooks/useDesarrolloImagenes';
import useUserRole from '@/hooks/useUserRole';
import useSubscriptionGuard from '@/hooks/useSubscriptionGuard';
import useChartData from '@/hooks/useChartData';

const DesarrolloDetail = () => {
  const { hasAccess, isLoading: isLoadingSubscription } = useSubscriptionGuard();
  
  const { id } = useParams<{ id: string }>();
  const { desarrollos, isLoading: isLoadingDesarrollos, refetch: refetchDesarrollos } = useDesarrollos({ limit: 1 });
  const { prototipos, isLoading: isLoadingPrototipos, refetch: refetchPrototipos } = usePrototipos({ desarrolloId: id });
  const { data: statsData, isLoading: isLoadingStats } = useDesarrolloStats(id);
  const { images, isLoading: isLoadingImagenes } = useDesarrolloImagenes(id);
  const { isAdmin } = useUserRole();
  const chartData = useChartData();
  
  const desarrollo = desarrollos.find(d => d.id === id);
  
  const isLoading = isLoadingDesarrollos || isLoadingPrototipos || isLoadingStats || isLoadingImagenes || isLoadingSubscription;
  
  if (isLoadingSubscription) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!hasAccess) {
    return null;
  }
  
  if (isLoading || !desarrollo) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="mb-4">
            <Skeleton className="h-8 w-1/3" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-1/4" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-1/2" />
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-1/4" />
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="mb-4">
          <Link to="/dashboard/desarrollos" className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Desarrollos
          </Link>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{desarrollo.nombre}</CardTitle>
            <div className="space-x-2">
              <DesarrolloEditButton desarrollo={desarrollo} onSuccess={refetchDesarrollos} />
              {isAdmin() && (
                <AdminResourceDialog 
                  resourceType="prototipos"
                  buttonText="Añadir prototipo" 
                  buttonIcon={<PlusIcon className="h-4 w-4 mr-2" />}
                  desarrolloId={desarrollo.id}
                  onSuccess={() => {
                    refetchPrototipos();
                    refetchDesarrollos();
                  }}
                />
              )}
            </div>
          </CardHeader>
          
          <CardContent className="grid gap-4">
            {desarrollo.ubicacion && (
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-slate-500" />
                <p className="text-sm text-slate-700">{desarrollo.ubicacion}</p>
              </div>
            )}
            
            <Tabs defaultValue="imagenes" className="w-full">
              <TabsList>
                <TabsTrigger value="imagenes">Imágenes</TabsTrigger>
                <TabsTrigger value="prototipos">Prototipos</TabsTrigger>
                <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="imagenes" className="space-y-2">
                {images && images.length > 0 ? (
                  <DesarrolloImageCarousel imagenes={images} />
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No hay imágenes</AlertTitle>
                    <AlertDescription>Este desarrollo no tiene imágenes cargadas.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="prototipos" className="space-y-2">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {prototipos && prototipos.length > 0 ? (
                    prototipos.map((prototipo) => (
                      <PrototipoCard 
                        key={prototipo.id} 
                        prototipo={prototipo}
                      />
                    ))
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>No hay prototipos</AlertTitle>
                      <AlertDescription>Este desarrollo no tiene prototipos creados.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="estadisticas" className="space-y-2">
                {statsData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Unidades Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{statsData.unidadesDisponibles || 0}</div>
                          <p className="text-sm text-slate-500">Total de unidades disponibles</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Unidades Totales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{statsData.totalUnidades || 0}</div>
                          <p className="text-sm text-slate-500">Total de unidades del desarrollo</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Avance Comercial</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-semibold">{statsData.avanceComercial || 0}%</div>
                          <p className="text-sm text-slate-500">Porcentaje de unidades vendidas</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Ventas Mensuales</CardTitle>
                        <CardDescription>Ventas realizadas en los últimos meses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72 w-full">
                          {chartData.map((item, index) => (
                            <div key={index} className="flex justify-between mb-2">
                              <span>{item.date}</span>
                              <span>$ {item.Ventas.toLocaleString('en-US')}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No hay estadísticas</AlertTitle>
                    <AlertDescription>No se pudieron cargar las estadísticas para este desarrollo.</AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DesarrolloDetail;
