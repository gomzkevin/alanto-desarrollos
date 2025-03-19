
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

type Desarrollo = Tables<"desarrollos">;

const DesarrollosPage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [desarrollosWithRealCounts, setDesarrollosWithRealCounts] = useState<Desarrollo[]>([]);
  const [hasTriedInitialLoad, setHasTriedInitialLoad] = useState(false);
  
  // Get user data first
  const { 
    userId,
    isAdmin,
    isLoading: isUserLoading 
  } = useUserRole();
  
  // Only fetch desarrollos when userId is available
  const { 
    desarrollos = [], 
    isLoading: isDesarrollosLoading,
    isFetching: isDesarrollosFetching,
    error,
    refetch,
    status: desarrollosStatus
  } = useDesarrollos({ 
    withPrototipos: true,
    userId 
  });
  
  const { countDesarrolloUnidadesByStatus } = useUnidades();

  // Debug logs to track component lifecycle and data fetching
  useEffect(() => {
    console.log('DesarrollosPage - Component lifecycle:', { 
      userId,
      isUserLoading,
      isDesarrollosLoading,
      isDesarrollosFetching,
      hasTriedInitialLoad,
      desarrollosStatus,
      desarrollosCount: desarrollos.length
    });
  }, [
    userId, 
    isUserLoading, 
    isDesarrollosLoading, 
    isDesarrollosFetching,
    hasTriedInitialLoad,
    desarrollosStatus,
    desarrollos.length
  ]);

  // Fetch desarrollos when userId becomes available
  useEffect(() => {
    if (userId && !isUserLoading && !hasTriedInitialLoad) {
      console.log('Forcing desarrollos refetch because userId is now available:', userId);
      refetch().then(() => {
        setHasTriedInitialLoad(true);
      });
    }
  }, [userId, isUserLoading, refetch, hasTriedInitialLoad]);

  // When desarrollos are updated, update real counts
  useEffect(() => {
    const updateRealUnitCounts = async () => {
      if (desarrollos.length === 0 || isDesarrollosLoading) return;
      
      try {
        console.log('Updating real unit counts for', desarrollos.length, 'desarrollos');
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
  }, [desarrollos, isDesarrollosLoading, countDesarrolloUnidadesByStatus]);

  const canCreateResource = () => {
    return isAdmin();
  };

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

  // Determine which desarrollos to display
  const displayDesarrollos = desarrollosWithRealCounts.length > 0 
    ? normalizeDesarrollos(desarrollosWithRealCounts)
    : normalizeDesarrollos(desarrollos as Desarrollo[]);

  // Determine if we're in a loading state
  const isLoading = isUserLoading || (isDesarrollosLoading && !hasTriedInitialLoad);
  const hasNoData = !isLoading && !isDesarrollosFetching && displayDesarrollos.length === 0;
  
  // Combined status for debugging
  const loadingStatus = {
    isUserLoading,
    isDesarrollosLoading,
    isDesarrollosFetching,
    hasTriedInitialLoad,
    userId: !!userId,
    hasNoData
  };
  console.log('DesarrollosPage render state:', loadingStatus);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Desarrollos Inmobiliarios</h1>
            <p className="text-slate-600">Gestiona y monitorea tus desarrollos inmobiliarios</p>
          </div>
          
          {canCreateResource() && (
            <Button 
              onClick={() => setOpenDialog(true)}
              className="flex items-center gap-2"
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
            defaultValues={userId ? { user_id: userId } : undefined}
          />
        </div>

        {isLoading ? (
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
        ) : hasNoData ? (
          <div className="text-center py-10">
            <p className="text-slate-600">No tienes desarrollos inmobiliarios</p>
            {canCreateResource() && (
              <Button 
                className="mt-4"
                onClick={() => setOpenDialog(true)}
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
