
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import useDesarrollos from '@/hooks/useDesarrollos';
import DesarrolloCard from '@/components/dashboard/DesarrolloCard';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { useUserRole } from '@/hooks/useUserRole';
import { Tables } from '@/integrations/supabase/types';
import useUnidades from '@/hooks/useUnidades';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

type Desarrollo = Tables<"desarrollos">;

const DesarrollosPage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [desarrollosWithRealCounts, setDesarrollosWithRealCounts] = useState<Desarrollo[]>([]);
  const [hasTriedInitialLoad, setHasTriedInitialLoad] = useState(false);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  
  // Get user info from useUserRole hook
  const { 
    userId,
    empresaId,
    isAdmin,
    isLoading: isUserLoading 
  } = useUserRole();
  
  // Use permissions hook to check if user can create desarrollos
  const { canCreateDesarrollo, hasActiveSubscription } = usePermissions();
  
  // Use empresa_id instead of user_id for filtering desarrollos
  const { 
    desarrollos = [], 
    isLoading, 
    error,
    refetch,
    isFetched
  } = useDesarrollos({ 
    withPrototipos: true,
    empresaId // Use empresaId instead of userId
  });
  
  const { countDesarrolloUnidadesByStatus } = useUnidades();

  // Force a refetch when empresaId becomes available
  useEffect(() => {
    if (empresaId !== null && !hasTriedInitialLoad) {
      console.log('Empresa ID available, forcing refetch:', empresaId);
      refetch();
      setHasTriedInitialLoad(true);
    }
  }, [empresaId, refetch, hasTriedInitialLoad]);

  // Update permissions loaded state
  useEffect(() => {
    // Check if user data and subscription info are loaded
    if (!isUserLoading && empresaId !== null) {
      // Perform an async check to ensure subscription data is loaded
      const checkPermissions = async () => {
        await hasActiveSubscription();
        setPermissionsLoaded(true);
      };
      
      checkPermissions();
    }
  }, [isUserLoading, empresaId, hasActiveSubscription]);

  // Update unit counts when desarrollos change
  useEffect(() => {
    const updateRealUnitCounts = async () => {
      if (desarrollos.length === 0 || isLoading) return;
      
      try {
        const updatedDesarrollos = await Promise.all(
          desarrollos.map(async (desarrollo) => {
            try {
              const counts = await countDesarrolloUnidadesByStatus(desarrollo.id);
              
              return {
                ...desarrollo,
                unidades_disponibles: counts.disponibles,
                total_unidades: counts.total || 0
              };
            } catch (error) {
              console.error('Error updating real counts for desarrollo:', desarrollo.id, error);
              return desarrollo;
            }
          })
        );
        
        setDesarrollosWithRealCounts(updatedDesarrollos);
      } catch (error) {
        console.error('Error updating unit counts:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los conteos de unidades",
          variant: "destructive"
        });
      }
    };
    
    updateRealUnitCounts();
  }, [desarrollos, isLoading]);

  const normalizeDesarrollos = (desarrollos: Desarrollo[]): Desarrollo[] => {
    return desarrollos.map(desarrollo => {
      const normalizedDesarrollo = {
        ...desarrollo,
        unidades_disponibles: Math.min(
          desarrollo.unidades_disponibles || 0,
          desarrollo.total_unidades || 0
        ),
        avance_porcentaje: desarrollo.total_unidades 
          ? Math.round(((desarrollo.total_unidades - (desarrollo.unidades_disponibles || 0)) / desarrollo.total_unidades) * 100)
          : 0
      };
      
      return normalizedDesarrollo;
    });
  };

  const handleDesarrolloClick = (id: string) => {
    navigate(`/dashboard/desarrollos/${id}`);
  };

  const displayDesarrollos = desarrollosWithRealCounts.length > 0 
    ? normalizeDesarrollos(desarrollosWithRealCounts)
    : normalizeDesarrollos(desarrollos as Desarrollo[]);

  // Unified loading state
  const isActuallyLoading = isUserLoading || (isLoading && !isFetched);
  
  // Add debug logs to help troubleshoot
  console.log('Desarrollo page render:', { 
    userId,
    empresaId,
    isUserLoading,
    isLoading,
    isFetched,
    hasTriedInitialLoad,
    permissionsLoaded,
    desarrollosCount: desarrollos.length,
    displayDesarrollosCount: displayDesarrollos.length,
    canCreateDesarrollo: canCreateDesarrollo()
  });

  // Determine if the create button should be disabled
  // Button is disabled by default until permissions are fully loaded
  const isCreateButtonDisabled = !permissionsLoaded || !canCreateDesarrollo();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Desarrollos Inmobiliarios</h1>
            <p className="text-slate-600">Gestiona y monitorea tus desarrollos inmobiliarios</p>
          </div>
          
          {isAdmin() && (
            <Button 
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2"
              disabled={isCreateButtonDisabled}
            >
              Nuevo desarrollo
            </Button>
          )}
          
          <AdminResourceDialog 
            resourceType="desarrollos" 
            buttonText="Nuevo desarrollo" 
            onSuccess={refetch}
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            defaultValues={empresaId ? { empresa_id: empresaId } : undefined}
          />
        </div>

        {isActuallyLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[400px] bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error al cargar desarrollos</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Intentar de nuevo
            </Button>
          </div>
        ) : displayDesarrollos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-600">No tienes desarrollos inmobiliarios</p>
            {isAdmin() && (
              <Button 
                className="mt-4"
                onClick={() => setOpenDialog(true)}
                disabled={isCreateButtonDisabled}
              >
                Crear tu primer desarrollo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayDesarrollos.map((desarrollo) => (
              <DesarrolloCard 
                key={desarrollo.id} 
                desarrollo={desarrollo}
                onViewDetails={handleDesarrolloClick}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DesarrollosPage;
