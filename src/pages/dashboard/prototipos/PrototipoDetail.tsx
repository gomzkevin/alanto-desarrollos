
import { useState, useEffect } from 'react';
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { 
    unidades, 
    isLoading: unidadesLoading, 
    refetch: refetchUnidades,
    createMultipleUnidades
  } = useUnidades({ prototipo_id: id });
  
  const unitCounts = useUnitCounts(unidades);
  
  // Trigger refetch of unidades periodically if component is mounted
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (id) {
        console.log('Periodic refresh of unidades');
        refetchUnidades();
      }
    }, 3000); // Refresh every 3 seconds
    
    return () => clearInterval(intervalId);
  }, [id, refetchUnidades]);
  
  // Also trigger refetch when dialogs are closed
  useEffect(() => {
    if (!openAddUnidadDialog && !openEditDialog) {
      setTimeout(() => {
        console.log('Dialog closed, refreshing data');
        refetchUnidades();
        refetch();
      }, 500);
    }
  }, [openAddUnidadDialog, openEditDialog, refetchUnidades, refetch]);
  
  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
    refetchUnidades();
    setRefreshTrigger(prev => prev + 1);
  };
  
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
      
      // Force refresh everything
      setTimeout(() => {
        handleRefresh();
      }, 500);
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
            unidadesLoading={unidadesLoading}
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
        onClose={() => {
          setOpenEditDialog(false);
          // Wait before refreshing
          setTimeout(() => {
            handleRefresh();
          }, 500);
        }}
        onSuccess={() => {
          // Wait before refreshing
          setTimeout(() => {
            handleRefresh();
          }, 500);
        }}
      />
      
      <AdminResourceDialog 
        resourceType="unidades"
        open={openAddUnidadDialog}
        onClose={() => {
          setOpenAddUnidadDialog(false);
          // Wait before refreshing
          setTimeout(() => {
            handleRefresh();
          }, 500);
        }}
        onSuccess={() => {
          // Wait before refreshing
          setTimeout(() => {
            handleRefresh();
          }, 500);
        }}
        prototipo_id={id}
      />
    </DashboardLayout>
  );
};

export default PrototipoDetail;
