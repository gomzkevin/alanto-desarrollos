
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Building2, Users, Receipt, BarChart3, AlertCircle, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/spinner';
import { useVentaDetail } from '@/hooks/useVentaDetail';
import VentaHeader from './components/VentaHeader';
import VentaProgress from './components/VentaProgress';
import CompradorList from './components/CompradorList';
import PlanPagosForm from './components/PlanPagosForm';
import PagosTab from './components/PagosTab';
import EstadisticasVenta from './components/EstadisticasVenta';
import FraccionamientoDialog from './components/FraccionamientoDialog';

const VentaDetail = () => {
  const { ventaId } = useParams<{ ventaId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFraccionamientoDialogOpen, setIsFraccionamientoDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    ventaDetail, 
    isLoading, 
    error, 
    refetch,
    updateVenta,
    createCompradorVenta,
    updateCompradorVenta,
    deleteCompradorVenta,
    upsertPlanPago,
    createPago,
    updatePagoEstado,
    isUpdating
  } = useVentaDetail(ventaId);

  const handleGoBack = () => {
    navigate('/dashboard/ventas');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500); // Para dar tiempo a la animación
  };

  const handleActivateVentaFraccional = async () => {
    if (!ventaDetail || ventaDetail.es_fraccional) return;
    
    try {
      // Activar modo fraccional en la venta
      await updateVenta({
        es_fraccional: true
      });
      
      // Cerrar diálogo
      setIsFraccionamientoDialogOpen(false);
    } catch (error) {
      console.error('Error al activar venta fraccional:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-lg text-slate-600">Cargando detalles de la venta...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !ventaDetail) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudieron cargar los detalles de la venta.
              {error instanceof Error && <p className="mt-2">{error.message}</p>}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { unidad, compradores = [] } = ventaDetail;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={handleGoBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            {!ventaDetail.es_fraccional && (
              <Button
                variant="default"
                onClick={() => setIsFraccionamientoDialogOpen(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Convertir a Fraccional
              </Button>
            )}
          </div>
        </div>

        <VentaHeader venta={ventaDetail} />
        
        <VentaProgress venta={ventaDetail} />

        <div className="rounded-lg border shadow-sm">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Building2 className="h-4 w-4 mr-2" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="compradores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Users className="h-4 w-4 mr-2" />
                  Compradores
                </TabsTrigger>
                <TabsTrigger value="pagos" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Receipt className="h-4 w-4 mr-2" />
                  Pagos
                </TabsTrigger>
                <TabsTrigger value="estadisticas" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Estadísticas
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Información de la Unidad</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Número</p>
                        <p className="font-medium">{unidad?.numero || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant="outline" className={
                          unidad?.estado === 'vendido' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }>
                          {unidad?.estado === 'vendido' ? 'Vendido' : 'En Proceso'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Prototipo</p>
                        <p className="font-medium">{unidad?.prototipo?.nombre || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Desarrollo</p>
                        <p className="font-medium">{unidad?.prototipo?.desarrollo?.nombre || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Información de la Venta</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Venta</p>
                        <Badge variant="outline" className={
                          ventaDetail.es_fraccional 
                            ? 'bg-blue-50 text-blue-600 border-blue-200' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }>
                          {ventaDetail.es_fraccional ? 'Fraccional' : 'Individual'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge variant="outline" className={
                          ventaDetail.estado === 'completada' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }>
                          {ventaDetail.estado === 'completada' ? 'Completada' : 'En Proceso'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
                        <p className="font-medium">
                          {new Date(ventaDetail.fecha_inicio).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Última Actualización</p>
                        <p className="font-medium">
                          {new Date(ventaDetail.fecha_actualizacion).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-lg border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Compradores</h3>
                      <Badge variant="outline" className="bg-slate-50">
                        {compradores.length} {compradores.length === 1 ? 'comprador' : 'compradores'}
                      </Badge>
                    </div>
                    
                    {compradores.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        No hay compradores registrados
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {compradores.map(comprador => (
                          <div key={comprador.id} className="flex justify-between p-3 rounded-md bg-muted/50">
                            <div>
                              <p className="font-medium">{comprador.comprador?.nombre || 'Sin nombre'}</p>
                              <p className="text-sm text-muted-foreground">
                                {comprador.comprador?.email || 'Sin email'} • 
                                {comprador.comprador?.telefono ? ` ${comprador.comprador.telefono}` : ' Sin teléfono'}
                              </p>
                            </div>
                            {ventaDetail.es_fraccional && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                {comprador.porcentaje_propiedad}%
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border p-4 space-y-4">
                    <h3 className="text-lg font-semibold">Notas</h3>
                    <div className="bg-muted/50 p-3 rounded-md min-h-[100px]">
                      {ventaDetail.notas || 'No hay notas registradas para esta venta.'}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const nuevaNota = window.prompt('Ingrese una nota para esta venta:', ventaDetail.notas || '');
                        if (nuevaNota !== null) {
                          updateVenta({ notas: nuevaNota });
                        }
                      }}
                    >
                      Editar Notas
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="compradores" className="p-4">
              <CompradorList 
                compradores={compradores}
                ventaId={ventaDetail.id}
                esFraccional={ventaDetail.es_fraccional}
                precioTotal={ventaDetail.precio_total}
                onUpdateComprador={updateCompradorVenta}
                onDeleteComprador={deleteCompradorVenta}
                onCreateComprador={createCompradorVenta}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="pagos" className="p-4">
              <PagosTab 
                compradores={compradores}
                esFraccional={ventaDetail.es_fraccional}
                ventaId={ventaDetail.id}
                onCreatePago={createPago}
                onUpdatePagoEstado={updatePagoEstado}
                onUpsertPlanPago={upsertPlanPago}
                isUpdating={isUpdating}
              />
            </TabsContent>

            <TabsContent value="estadisticas" className="p-4">
              <EstadisticasVenta venta={ventaDetail} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <FraccionamientoDialog 
        isOpen={isFraccionamientoDialogOpen}
        onClose={() => setIsFraccionamientoDialogOpen(false)}
        onConfirm={handleActivateVentaFraccional}
      />
    </DashboardLayout>
  );
};

export default VentaDetail;
