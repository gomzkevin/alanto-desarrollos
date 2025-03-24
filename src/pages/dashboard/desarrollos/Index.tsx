
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import useDesarrollos, { Desarrollo } from '@/hooks/useDesarrollos';
import DesarrolloCard from '@/components/dashboard/DesarrolloCard';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { useUserRole } from '@/hooks/useUserRole';
import useUnidades from '@/hooks/useUnidades';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

const DesarrollosPage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [desarrollosWithRealCounts, setDesarrollosWithRealCounts] = useState<Desarrollo[]>([]);
  const [hasTriedInitialLoad, setHasTriedInitialLoad] = useState(false);
  
  const { 
    userId,
    empresaId,
    isAdmin,
    isLoading: isUserLoading 
  } = useUserRole();
  
  const { 
    desarrollos = [], 
    isLoading, 
    error,
    refetch
  } = useDesarrollos();
  
  const { countDesarrolloUnidadesByStatus } = useUnidades();

  const canCreateResource = () => {
    return isAdmin();
  };

  useEffect(() => {
    if (empresaId !== null && !hasTriedInitialLoad) {
      console.log('Empresa ID available, forcing refetch:', empresaId);
      refetch();
      setHasTriedInitialLoad(true);
    }
  }, [empresaId, refetch, hasTriedInitialLoad]);

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

  const normalizeDesarrollos = (desarrollosData: Desarrollo[]): Desarrollo[] => {
    return desarrollosData.map(desarrollo => {
      // Use a more complete type assertion that includes all required properties
      // with default values for any missing properties
      const normalizedDesarrollo = {
        ...desarrollo,
        unidades_disponibles: Math.min(
          desarrollo.unidades_disponibles || 0,
          desarrollo.total_unidades || 0
        ),
        avance_porcentaje: desarrollo.total_unidades 
          ? Math.round(((desarrollo.total_unidades - (desarrollo.unidades_disponibles || 0)) / desarrollo.total_unidades) * 100)
          : 0,
        // Provide default values for all required properties that might be missing
        adr_base: desarrollo.adr_base || 0,
        amenidades: desarrollo.amenidades || null,
        comision_operador: desarrollo.comision_operador || 0,
        descripcion: desarrollo.descripcion || '',
        empresa_id: desarrollo.empresa_id || 0,
        es_gastos_fijos_porcentaje: desarrollo.es_gastos_fijos_porcentaje || false,
        es_gastos_variables_porcentaje: desarrollo.es_gastos_variables_porcentaje || false,
        es_impuestos_porcentaje: desarrollo.es_impuestos_porcentaje || false,
        es_mantenimiento_porcentaje: desarrollo.es_mantenimiento_porcentaje || false,
        gastos_fijos: desarrollo.gastos_fijos || 0,
        gastos_variables: desarrollo.gastos_variables || 0,
        impuestos: desarrollo.impuestos || 0,
        mantenimiento_valor: desarrollo.mantenimiento_valor || 0,
        moneda: desarrollo.moneda || 'MXN',
        nombre: desarrollo.nombre,
        ocupacion_anual: desarrollo.ocupacion_anual || 0,
        total_unidades: desarrollo.total_unidades || 0,
        ubicacion: desarrollo.ubicacion,
        user_id: desarrollo.user_id || ''
      } as Desarrollo;
      
      return normalizedDesarrollo;
    });
  };

  const handleDesarrolloClick = (id: string) => {
    navigate(`/dashboard/desarrollos/${id}`);
  };

  const displayDesarrollos = desarrollosWithRealCounts.length > 0 
    ? normalizeDesarrollos(desarrollosWithRealCounts)
    : normalizeDesarrollos(desarrollos);

  const isActuallyLoading = isUserLoading || isLoading;
  
  console.log('Desarrollo page render:', { 
    userId,
    empresaId,
    isUserLoading,
    isLoading,
    hasTriedInitialLoad,
    desarrollosCount: desarrollos.length,
    displayDesarrollosCount: displayDesarrollos.length
  });

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
