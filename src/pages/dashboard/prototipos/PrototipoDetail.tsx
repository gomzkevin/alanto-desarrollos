
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, MapPin, Box, Building, Ruler, Bed, Bath, Car, Pencil, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { useToast } from '@/hooks/use-toast';
import useUnidades from '@/hooks/useUnidades';
import { UnidadTable } from './UnidadTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import { ExtendedPrototipo } from '@/hooks/usePrototipos';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type Prototipo = Tables<"prototipos">;
type Desarrollo = Tables<"desarrollos">;

const fetchPrototipoById = async (id: string) => {
  const { data, error } = await supabase
    .from('prototipos')
    .select('*, desarrollo:desarrollo_id(*)')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return data as ExtendedPrototipo;
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
  
  const {
    data: prototipo,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['prototipo', id],
    queryFn: () => fetchPrototipoById(id as string),
    enabled: !!id,
  });
  
  const { 
    unidades, 
    isLoading: unidadesLoading, 
    error: unidadesError,
    refetch: refetchUnidades,
    createMultipleUnidades,
    updatePrototipoUnidades
  } = useUnidades({ prototipo_id: id });
  
  // Calculate actual counts from the unidades array
  const calculateActualCounts = () => {
    if (!unidades || unidades.length === 0) {
      return {
        total: prototipo?.total_unidades || 0,
        disponibles: prototipo?.unidades_disponibles || 0,
        vendidas: prototipo?.unidades_vendidas || 0,
        conAnticipo: prototipo?.unidades_con_anticipo || 0
      };
    }
    
    const disponibles = unidades.filter(u => u.estado === 'disponible').length;
    const vendidas = unidades.filter(u => u.estado === 'vendido').length;
    const conAnticipo = unidades.filter(u => u.estado === 'apartado' || u.estado === 'en_proceso').length;
    
    return {
      total: unidades.length,
      disponibles,
      vendidas,
      conAnticipo
    };
  };
  
  const unidadesCounts = calculateActualCounts();
  
  // Update the prototipo unit counts in database if they don't match the calculated values
  useEffect(() => {
    const syncPrototipoUnitCounts = async () => {
      if (id && !unidadesLoading && !isLoading && prototipo && unidades.length > 0) {
        const counts = calculateActualCounts();
        
        // Check if counts in prototipo record don't match actual counts from unidades
        const countsNeedUpdate = 
          prototipo.unidades_disponibles !== counts.disponibles ||
          prototipo.unidades_vendidas !== counts.vendidas ||
          prototipo.unidades_con_anticipo !== counts.conAnticipo ||
          prototipo.total_unidades !== counts.total;
        
        if (countsNeedUpdate) {
          try {
            await updatePrototipoUnidades(id);
            // Refetch prototipo to get updated counts
            refetch();
          } catch (error) {
            console.error('Error updating prototipo units:', error);
          }
        }
      }
    };
    
    syncPrototipoUnitCounts();
  }, [unidades, id, prototipo, isLoading, unidadesLoading, updatePrototipoUnidades, refetch]);
  
  const handleBack = () => {
    const desarrollo = prototipo?.desarrollo as Desarrollo | undefined;
    if (desarrollo?.id) {
      navigate(`/dashboard/desarrollos/${desarrollo.id}`);
    } else {
      navigate('/dashboard/desarrollos');
    }
  };
  
  const handleRefresh = () => {
    refetch();
    refetchUnidades();
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
      refetch();
      refetchUnidades();
    } catch (error) {
      console.error('Error al generar unidades:', error);
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (error || !prototipo) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No se pudo cargar la información del prototipo.
              {error && <p className="mt-2">{(error as Error).message}</p>}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            Intentar de nuevo
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const desarrollo = prototipo.desarrollo as Desarrollo | null;
  
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
          
          <div className="bg-slate-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Unidades
                </h2>
                <p className="text-slate-600">
                  {unidadesLoading ? (
                    <Skeleton className="h-4 w-64" />
                  ) : (
                    <>
                      {unidadesCounts.total} de {prototipo.total_unidades} unidades registradas 
                      ({unidadesCounts.disponibles} disponibles, 
                      {unidadesCounts.vendidas} vendidas, 
                      {unidadesCounts.conAnticipo} con anticipo)
                    </>
                  )}
                </p>
              </div>
              
              <div className="flex space-x-2">
                {!unidadesLoading && unidadesCounts.total < prototipo.total_unidades && (
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
                max={prototipo.total_unidades - unidadesCounts.total}
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
            <Button onClick={handleGenerarUnidades}>Generar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AdminResourceDialog 
        resourceType="prototipos"
        resourceId={id}
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSuccess={handleRefresh}
      />
      
      <AdminResourceDialog 
        resourceType="unidades"
        open={openAddUnidadDialog}
        onClose={() => setOpenAddUnidadDialog(false)}
        onSuccess={refetchUnidades}
        prototipo_id={id}
      />
    </DashboardLayout>
  );
};

export default PrototipoDetail;
