
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
  
  // Consulta de unidades con parámetros estables
  const unidadesParams = id ? { prototipo_id: id } : undefined;
  const { 
    unidades: fetchedUnidades, 
    isLoading: unidadesLoading, 
    refetch: refetchUnidades,
    createMultipleUnidades
  } = useUnidades(unidadesParams);
  
  // Asegurar que unidades siempre sea un array
  const safeUnidades = Array.isArray(fetchedUnidades) ? fetchedUnidades : [];
  
  // Memoize conteo de unidades para estabilidad
  const unitCounts = useUnitCounts(safeUnidades);
  
  // Verificaciones de permisos (valores memorizados serían mejores)
  const canAddMore = canCreatePrototipo();
  const canAddUnidades = canCreateUnidad();
  
  // Manejador de actualización con límite de frecuencia
  const handleRefresh = useCallback(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;
    
    // No permitir actualizaciones más frecuentes que cada 3 segundos
    if (isRefreshing || timeSinceLastRefresh < 3000) {
      console.log('Evitando actualización rápida:', timeSinceLastRefresh, 'ms desde la última actualización');
      return;
    }
    
    setIsRefreshing(true);
    console.log('Actualización manual iniciada en', new Date().toISOString());
    lastRefreshTimeRef.current = now;
    
    refetchUnidades().finally(() => {
      // Retraso para evitar parpadeo
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    });
  }, [refetchUnidades, isRefreshing]);
  
  // Efecto para actualizar cuando cambian los diálogos
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (!openAddUnidadDialog && !openEditDialog) {
      // Agregar un retraso para actualizar solo después de cerrar los diálogos
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
      
      // Agregar un retraso largo antes de actualizar
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
  
  // Memoize manejadores de eventos
  const handleAddUnidadClick = useCallback(() => {
    // Verificar si el usuario puede crear unidades según su plan
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
    // Solo permitir edición si es administrador
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.preventDefault(); handleBack(e); }} 
              type="button"
            >
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.preventDefault(); handleBack(e); }} 
            type="button"
          >
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
            onClick={(e) => { e.preventDefault(); refetch(); }}
            type="button"
          >
            Intentar de nuevo
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  // Estado de carga combinado para evitar estados contradictorios
  const combinedLoadingState = isRefreshing || unidadesLoading;
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <PrototipoHeader 
          prototipo={prototipo} 
          onBack={(e) => { if(e) { e.preventDefault(); } handleBack(e); }} 
          onEdit={(e) => { if(e) { e.preventDefault(); } handleEditClick(); }} 
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
