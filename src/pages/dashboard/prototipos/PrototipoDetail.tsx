
import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import useUnidades from '@/hooks/useUnidades';
import usePrototipoDetail from './hooks/usePrototipoDetail';
import PrototipoHeader from './components/PrototipoHeader';
import PrototipoSpecs from './components/PrototipoSpecs';
import PrototipoUnidades from './components/PrototipoUnidades';
import useUnitCounts from './hooks/useUnitCounts';

const PrototipoDetail = () => {
  const { toast } = useToast();
  const { id, prototipo, isLoading, error, refetch, handleBack, updatePrototipoImage } = usePrototipoDetail();
  const [openAddUnidadDialog, setOpenAddUnidadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  
  // Cancelar cualquier timer pendiente cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);
  
  const { 
    unidades, 
    isLoading: unidadesLoading, 
    refetch: refetchUnidades,
    createMultipleUnidades
  } = useUnidades({ prototipo_id: id });
  
  const unitCounts = useUnitCounts(unidades);
  
  const handleRefresh = useCallback(() => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('Manual refresh triggered');
    
    Promise.all([
      refetchUnidades(),
      refetch()
    ]).then(() => {
      console.log('Data refresh completed');
      setIsRefreshing(false);
    }).catch(error => {
      console.error('Error refreshing data:', error);
      setIsRefreshing(false);
    });
  }, [refetch, refetchUnidades, isRefreshing]);
  
  // Configurar un refresco periódico más largo (2 minutos en vez de 30 segundos)
  useEffect(() => {
    if (!id) return;
    
    // Limpiamos cualquier intervalo existente
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    // Establecemos un nuevo intervalo con un tiempo mucho más largo
    refreshTimerRef.current = window.setInterval(() => {
      console.log('Periodic refresh of unidades');
      refetchUnidades().catch(err => {
        console.error('Error in periodic refresh:', err);
      });
    }, 120000); // 2 minutos
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [id, refetchUnidades]);
  
  // Solo refrescar cuando realmente se necesite (después de cerrar diálogos)
  useEffect(() => {
    if (!openAddUnidadDialog && !openEditDialog) {
      // Añadir un pequeño retraso para evitar refrescos inmediatos
      const timeoutId = setTimeout(() => {
        handleRefresh();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [openAddUnidadDialog, openEditDialog, handleRefresh]);
  
  const handleGenerarUnidades = async (cantidad: number, prefijo: string) => {
    if (!id || cantidad <= 0) return;
    
    try {
      await createMultipleUnidades.mutateAsync({
        prototipo_id: id,
        cantidad: cantidad,
        prefijo: prefijo
      });
      
      toast({
        title: "Unidades generadas",
        description: `Se han generado ${cantidad} unidades exitosamente.`
      });
      
      // Añadir un retraso antes del refresco
      setTimeout(handleRefresh, 1000);
    } catch (error) {
      console.error('Error al generar unidades:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar las unidades",
        variant: "destructive"
      });
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
            onClick={() => handleRefresh()}
          >
            Intentar de nuevo
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <PrototipoHeader 
          prototipo={prototipo} 
          onBack={handleBack} 
          onEdit={() => setOpenEditDialog(true)} 
          updatePrototipoImage={updatePrototipoImage}
        />
        
        <div className="space-y-8">
          <PrototipoSpecs prototipo={prototipo} />
          
          <PrototipoUnidades 
            prototipo={prototipo}
            unidades={unidades}
            unidadesLoading={unidadesLoading || isRefreshing}
            unitCounts={unitCounts}
            onAddUnidad={() => setOpenAddUnidadDialog(true)}
            onGenerateUnidades={handleGenerarUnidades}
            onRefreshUnidades={handleRefresh}
          />
        </div>
      </div>
      
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
        onSuccess={handleRefresh}
        prototipo_id={id}
      />
    </DashboardLayout>
  );
};

export default PrototipoDetail;
