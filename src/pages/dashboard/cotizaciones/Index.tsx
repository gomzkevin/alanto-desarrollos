import { useState, useEffect } from 'react';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { useCotizaciones } from '@/hooks/useCotizaciones';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog/AdminResourceDialog';
import CotizacionDetailDialog from './CotizacionDetailDialog';
import useDesarrollos from '@/hooks/useDesarrollos';
import useUserRole from '@/hooks/useUserRole';
import ExportPDFButton from '@/components/dashboard/ExportPDFButton';
import EditCotizacionButton from '@/components/dashboard/EditCotizacionButton';
import useSubscriptionGuard from '@/hooks/useSubscriptionGuard';

export default function CotizacionesPage() {
  // Verificar suscripción activa
  const { hasAccess, isLoading: isLoadingSubscription } = useSubscriptionGuard();
  
  const [selectedDesarrollo, setSelectedDesarrollo] = useState<string | null>(null);
  const { cotizaciones, isLoading, refetch } = useCotizaciones({ withRelations: true });
  const { desarrollos, isLoading: isLoadingDesarrollos } = useDesarrollos();
  const { isAdmin } = useUserRole();
  
  const [filteredCotizaciones, setFilteredCotizaciones] = useState(cotizaciones);
  
  // Filtrar cotizaciones cuando cambian los datos o el filtro
  useEffect(() => {
    if (selectedDesarrollo) {
      setFilteredCotizaciones(cotizaciones.filter(c => c.desarrollo_id === selectedDesarrollo));
    } else {
      setFilteredCotizaciones(cotizaciones);
    }
  }, [cotizaciones, selectedDesarrollo]);
  
  // Manejar cambio en el filtro de desarrollo
  const handleDesarrolloChange = (value: string) => {
    setSelectedDesarrollo(value === 'todos' ? null : value);
  };
  
  // Estado de carga general
  const isLoadingData = isLoading || isLoadingDesarrollos || isLoadingSubscription;
  
  // Si todavía estamos verificando la suscripción, mostrar un estado de carga
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
  
  // Si no tiene acceso, no renderizar nada (el hook se encarga de la redirección)
  if (!hasAccess) {
    return null;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Cotizaciones</CardTitle>
          <div className="space-x-2">
            <Select onValueChange={handleDesarrolloChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por desarrollo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los desarrollos</SelectItem>
                {desarrollos.map((desarrollo) => (
                  <SelectItem key={desarrollo.id} value={desarrollo.id}>
                    {desarrollo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin() && (
              <AdminResourceDialog
                resourceType="cotizaciones"
                buttonText="Nueva cotización"
                buttonIcon={<PlusIcon className="h-4 w-4 mr-2" />}
              />
            )}
            <ExportPDFButton data={filteredCotizaciones} filename="cotizaciones.pdf" />
          </div>
        </div>
        {isLoadingData ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCotizaciones.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCotizaciones.map((cotizacion) => (
              <Card key={cotizacion.id}>
                <CardHeader>
                  <CardTitle>{cotizacion.lead?.nombre || 'Cliente desconocido'}</CardTitle>
                  <CardDescription>
                    Desarrollo: {cotizacion.desarrollo?.nombre || 'Sin desarrollo'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Prototipo:</strong> {cotizacion.prototipo?.nombre || 'Sin prototipo'}
                  </p>
                  <p>
                    <strong>Monto anticipo:</strong> ${cotizacion.monto_anticipo}
                  </p>
                  <p>
                    <strong>Número de pagos:</strong> {cotizacion.numero_pagos}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <CotizacionDetailDialog cotizacion={cotizacion} />
                  {isAdmin() && (
                    <EditCotizacionButton
                      cotizacion={cotizacion}
                      onSuccess={() => {
                        toast({
                          title: 'Cotización actualizada',
                          description: 'La cotización se ha actualizado correctamente',
                        });
                        refetch();
                      }}
                    />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p>No hay cotizaciones registradas.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
