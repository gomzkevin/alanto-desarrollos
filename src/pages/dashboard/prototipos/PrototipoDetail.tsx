
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
import { usePermissions } from '@/hooks/usePermissions';
import { useUserRole } from '@/hooks/useUserRole';

const PrototipoDetail = () => {
  const { toast } = useToast();
  const { id, prototipo, isLoading, error, refetch, handleBack, updatePrototipoImage } = usePrototipoDetail();
  const [openAddUnidadDialog, setOpenAddUnidadDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshTimeRef = useRef(Date.now());
  const { isAdmin } = useUserRole();
  const { canCreatePrototipo, canCreateUnidad } = usePermissions();
  
  // Unidades fetching with stable params
  const unidadesParams = { prototipo_id: id };
  const { 
    unidades: fetchedUnidades, 
    isLoading: unidadesLoading, 
    refetch: refetchUnidades,
    createMultipleUnidades
  } = useUnidades(unidadesParams);
  
  // Ensure unidades is always an array
  const safeUnidades = Array.isArray(fetchedUnidades) ? fetchedUnidades : [];
  
  // Memoize unit counts for stability
  const unitCounts = useUnitCounts(safeUnidades);
  
  // Permissions checks (memoized values would be better)
  const canAddMore = canCreatePrototipo();
  const canAddUnidades = canCreateUnidad();
  
  // Throttled refresh handler
  const handleRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // No refreshes more frequent than every 3 seconds
    if (isRefreshing || timeSinceLastRefresh < 3000) {
      console.log('Avoiding rapid refresh:', timeSinceLastRefresh, 'ms since last refresh');
      return;
    }
    
    setIsRefreshing(true);
    console.log('Manual refresh triggered at', new Date().toISOString());
    lastRefreshTimeRef.current = now;
    
    refetchUnidades().finally(() => {
      // Delay to avoid flashing
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    });
  }, [refetchUnidades, isRefreshing]);
  
  // Effect to refresh when dialogs change
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!openAddUnidadDialog && !openEditDialog) {
      // Add a delay to refresh only after closing dialogs
      timeoutId = setTimeout(() => {
        handleRefresh();
      }, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [openAddUnidadDialog, openEditDialog, handleRefresh]);
  
  const handleGenerarUnidades = useCallback(async (cantidad: number, prefijo: string) => {
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
      
      // Add a long delay before refreshing
      setTimeout(handleRefresh, 1500);
    } catch (error) {
      console.error('Error al generar unidades:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar las unidades",
        variant: "destructive"
      });
    }
  }, [id, createMultipleUnidades, toast, handleRefresh]);
  
  // Memoize event handlers
  const handleAddUnidadClick = useCallback(() => {
    // Check if user can create units based on their plan
    if (isAdmin() && canAddUnidades) {
      setOpenAddUnidadDialog(true);
    } else if (!canAddUnidades) {
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de prototipos de tu plan. Actualiza tu suscripción para añadir más unidades.",
        variant: "warning",
      });
    } else {
      toast({
        title: "Permisos insuficientes",
        description: "Solo los administradores pueden añadir unidades.",
        variant: "destructive",
      });
    }
  }, [isAdmin, canAddUnidades, toast]);
  
  const handleEditClick = useCallback(() => {
    // Only allow editing if admin
    if (isAdmin()) {
      setOpenEditDialog(true);
    } else {
      toast({
        title: "Permisos insuficientes",
        description: "Solo los administradores pueden editar prototipos.",
        variant: "destructive",
      });
    }
  }, [isAdmin, toast]);
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center">
            <Button variant="outline" size="sm" onClick={handleBack} type="button">
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
          <Button variant="outline" size="sm" onClick={handleBack} type="button">
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
            type="button"
          >
            Intentar de nuevo
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Combined loading state to avoid contradictory states
  const combinedLoadingState = isRefreshing || unidadesLoading;
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <PrototipoHeader 
          prototipo={prototipo} 
          onBack={handleBack} 
          onEdit={handleEditClick} 
          updatePrototipoImage={updatePrototipoImage}
        />
        
        <div className="space-y-8">
          <PrototipoSpecs prototipo={prototipo} />
          
          <PrototipoUnidades 
            prototipo={prototipo}
            unidades={safeUnidades}
            unidadesLoading={combinedLoadingState}
            unitCounts={unitCounts}
            onAddUnidad={handleAddUnidadClick}
            onGenerateUnidades={handleGenerarUnidades}
            onRefreshUnidades={handleRefresh}
            canAddMore={canAddUnidades}
          />
        </div>
      </div>
      
      {isAdmin() && (
        <AdminResourceDialog 
          resourceType="prototipos"
          resourceId={id}
          open={openEditDialog}
          onClose={() => setOpenEditDialog(false)}
          onSuccess={() => {
            refetch();
            handleRefresh();
          }}
        />
      )}
      
      <AdminResourceDialog 
        resourceType="unidades"
        open={openAddUnidadDialog}
        onClose={() => setOpenAddUnidadDialog(false)}
        onSuccess={() => {
          setTimeout(handleRefresh, 500);
        }}
        prototipo_id={id}
      />
    </DashboardLayout>
  );
};

export default PrototipoDetail;
