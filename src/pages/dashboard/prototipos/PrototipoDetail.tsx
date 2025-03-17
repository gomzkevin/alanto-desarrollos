import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, MapPin, Box, Building, Ruler, Bed, Bath, Car, Pencil, PlusCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUnidades } from '@/hooks';
import { UnidadTable } from './UnidadTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const AdminResourceDialog = lazy(() => 
  import('@/components/dashboard/ResourceDialog/AdminResourceDialog')
);

type Prototipo = Tables<"prototipos">;
type Desarrollo = Tables<"desarrollos">;

const fetchPrototipoById = async (id: string) => {
  console.log('Fetching prototipo with ID:', id);
  
  if (!id) {
    throw new Error('ID de prototipo no válido');
  }
  
  try {
    const { data, error } = await supabase
      .from('prototipos')
      .select('*, desarrollo:desarrollo_id(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching prototipo:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No se encontró el prototipo');
    }
    
    console.log('Prototipo data fetched successfully:', data);
    return data as ExtendedPrototipo;
  } catch (error) {
    console.error('Exception in fetchPrototipoById:', error);
    throw error;
  }
};

const PrototipoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openAddUnidadDialog, setOpenAddUnidadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [generarUnidadesModalOpen, setGenerarUnidadesModalOpen] = useState(false);
  const [cantidadUnidades, setCantidadUnidades] = useState(1);
  const [prefijo, setPrefijo] = useState("");
  const [isRefetching, setIsRefetching] = useState(false);
  
  console.log('PrototipoDetail rendered with ID:', id);
  
  const {
    data: prototipo,
    isLoading,
    error,
    refetch,
    isError
  } = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
    staleTime: 60000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching prototipo details:', error);
        toast({
          title: 'Error',
          description: `No se pudo cargar el prototipo: ${error.message}`,
          variant: 'destructive',
        });
      }
    }
  });
  
  const { 
    unidades, 
    isLoading: unidadesLoading, 
    refetch: refetchUnidades,
    createMultipleUnidades,
    countUnidadesByStatus,
    isError: unidadesError
  } = useUnidades({ 
    prototipo_id: id,
    staleTime: 60000
  });
  
  const { 
    data: unitCounts,
    isLoading: isLoadingUnitCounts,
    refetch: refetchUnitCounts
  } = useQuery({
    queryKey: ['prototipo-unit-counts', id],
    queryFn: () => countUnidadesByStatus(id as string),
    enabled: !!id && !isError,
    staleTime: 60000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
  
  const handleBack = () => {
    const desarrollo = prototipo?.desarrollo as Desarrollo | undefined;
    if (desarrollo?.id) {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    } else {
      navigate('/dashboard/desarrollos');
    }
  };
  
  const handleRefresh = async () => {
    console.log('Refreshing prototipo data...');
    setIsRefetching(true);
    try {
      await Promise.all([
        refetch(), 
        refetchUnidades(),
        refetchUnitCounts()
      ]);
      
      toast({
        title: 'Datos actualizados',
        description: 'La información ha sido actualizada correctamente',
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsRefetching(false);
    }
  };
  
  const handleGenerarUnidades = async () => {
    if (!id || cantidadUnidades <= 0) return;
    
    try {
      await createMultipleUnidades.mutateAsync({
        prototipo_id: id,
        cantidad: cantidadUnidades,
        prefijo: prefijo
      });
      
      setGenerarUnidadesModalOpen(false);
      setCantidadUnidades(1);
      setPrefijo("");
      refetchUnidades();
      toast({
        title: 'Unidades generadas',
        description: `Se generaron ${cantidadUnidades} unidades correctamente`,
      });
    } catch (error) {
      console.error('Error al generar unidades:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar las unidades',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/desarrollos')}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw className={`mr-1 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-20 w-full" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (isError || !prototipo) {
    console.error('Error state in PrototipoDetail:', error);
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/desarrollos')}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
              <RefreshCw className={`mr-1 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
          
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudo cargar la información del prototipo.
              {error && <p className="mt-2">{(error as Error).message}</p>}
              <p className="mt-2">Compruebe su conexión a internet e intente de nuevo.</p>
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRefresh}
            disabled={isRefetching}
          >
            {isRefetching ? 'Actualizando...' : 'Intentar de nuevo'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const desarrollo = prototipo.desarrollo as Desarrollo | null;
  
  const displayedCounts = unitCounts || {
    disponibles: prototipo.unidades_disponibles || 0,
    vendidas: prototipo.unidades_vendidas || 0,
    con_anticipo: prototipo.unidades_con_anticipo || 0,
    total: prototipo.total_unidades || 0
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              {isRefetching ? 'Actualizando...' : 'Actualizar'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setOpenEditDialog(true)}
            >
              <Pencil className="mr-1 h-4 w-4" />
              Editar prototipo
            </Button>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{prototipo.nombre}</h1>
                <div className="flex items-center gap-2 mt-1 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{desarrollo?.nombre || 'Desarrollo no especificado'}</span>
                  <Badge className="ml-2 capitalize">{prototipo.tipo}</Badge>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(prototipo.precio)}
              </div>
            </div>
            
            {prototipo.descripcion && (
              <p className="text-slate-700 mt-2">{prototipo.descripcion}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Ruler className="h-6 w-6 text-slate-400 mb-2" />
                <div className="text-sm text-slate-500">Superficie</div>
                <div className="font-semibold">{prototipo.superficie || 0} m²</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Bed className="h-6 w-6 text-slate-400 mb-2" />
                <div className="text-sm text-slate-500">Habitaciones</div>
                <div className="font-semibold">{prototipo.habitaciones || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Bath className="h-6 w-6 text-slate-400 mb-2" />
                <div className="text-sm text-slate-500">Baños</div>
                <div className="font-semibold">{prototipo.baños || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Car className="h-6 w-6 text-slate-400 mb-2" />
                <div className="text-sm text-slate-500">Estacionamientos</div>
                <div className="font-semibold">{prototipo.estacionamientos || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          {unidadesError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No se pudieron cargar las unidades. Por favor, intenta actualizar la página.
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => refetchUnidades()}
                >
                  Reintentar
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="bg-slate-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Unidades
                  </h2>
                  <p className="text-slate-600">
                    {unidades.length} de {displayedCounts.total} unidades registradas 
                    ({displayedCounts.disponibles} disponibles, 
                    {displayedCounts.vendidas} vendidas, 
                    {displayedCounts.con_anticipo} con anticipo)
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  {unidades.length < prototipo.total_unidades && (
                    <Button onClick={() => setGenerarUnidadesModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Generar unidades
                    </Button>
                  )}
                  
                  <Button onClick={() => setOpenAddUnidadDialog(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar unidad
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="todas">
                <TabsList className="mb-4">
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                  <TabsTrigger value="disponibles">Disponibles</TabsTrigger>
                  <TabsTrigger value="apartadas">Apartadas</TabsTrigger>
                  <TabsTrigger value="vendidas">Vendidas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="todas">
                  <UnidadTable 
                    unidades={unidades} 
                    isLoading={unidadesLoading} 
                    onRefresh={refetchUnidades}
                    prototipo={prototipo}
                  />
                </TabsContent>
                
                <TabsContent value="disponibles">
                  <UnidadTable 
                    unidades={unidades.filter(u => u.estado === 'disponible')} 
                    isLoading={unidadesLoading} 
                    onRefresh={refetchUnidades}
                    prototipo={prototipo}
                  />
                </TabsContent>
                
                <TabsContent value="apartadas">
                  <UnidadTable 
                    unidades={unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso')} 
                    isLoading={unidadesLoading} 
                    onRefresh={refetchUnidades}
                    prototipo={prototipo}
                  />
                </TabsContent>
                
                <TabsContent value="vendidas">
                  <UnidadTable 
                    unidades={unidades.filter(u => u.estado === 'vendido')} 
                    isLoading={unidadesLoading} 
                    onRefresh={refetchUnidades}
                    prototipo={prototipo}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={generarUnidadesModalOpen} onOpenChange={setGenerarUnidadesModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar unidades</DialogTitle>
            <DialogDescription>
              Crea múltiples unidades para este prototipo de forma automática.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad de unidades</Label>
              <Input 
                id="cantidad" 
                type="number" 
                min="1" 
                max={prototipo.total_unidades - unidades.length}
                value={cantidadUnidades} 
                onChange={(e) => setCantidadUnidades(parseInt(e.target.value) || 1)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prefijo">Prefijo (opcional)</Label>
              <Input 
                id="prefijo" 
                value={prefijo} 
                onChange={(e) => setPrefijo(e.target.value)} 
                placeholder="Ej: 'Unidad-' resultará en Unidad-1, Unidad-2, etc."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerarUnidadesModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={handleGenerarUnidades}
              disabled={createMultipleUnidades.isPending}
            >
              {createMultipleUnidades.isPending ? 'Generando...' : 'Generar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {openEditDialog && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-4 rounded-md">Cargando editor...</div>
        </div>}>
          <AdminResourceDialog 
            resourceType="prototipos"
            resourceId={id}
            open={openEditDialog}
            onClose={() => {
              console.log('Closing edit dialog');
              setOpenEditDialog(false);
            }}
            onSuccess={() => {
              console.log('Edit successful, refreshing');
              setOpenEditDialog(false);
              handleRefresh();
            }}
          />
        </Suspense>
      )}
      
      {openAddUnidadDialog && (
        <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-4 rounded-md">Cargando editor...</div>
        </div>}>
          <AdminResourceDialog 
            resourceType="unidades"
            open={openAddUnidadDialog}
            onClose={() => {
              console.log('Closing add unidad dialog');
              setOpenAddUnidadDialog(false);
            }}
            onSuccess={() => {
              console.log('Add successful, refreshing');
              setOpenAddUnidadDialog(false);
              refetchUnidades();
            }}
            prototipo_id={id}
          />
        </Suspense>
      )}
    </DashboardLayout>
  );
};

export default PrototipoDetail;
