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
      const normalizedDesarrollo: Desarrollo = {
        id: desarrollo.id,
        nombre: desarrollo.nombre,
        descripcion: desarrollo.descripcion || '',
        ubicacion: desarrollo.ubicacion,
        latitud: desarrollo.latitud || null,
        longitud: desarrollo.longitud || null,
        estado: desarrollo.estado || '',
        fecha_inicio: desarrollo.fecha_inicio || null,
        fecha_finalizacion_estimada: desarrollo.fecha_finalizacion_estimada || null,
        empresa_id: desarrollo.empresa_id,
        created_at: desarrollo.created_at,
        updated_at: desarrollo.updated_at,
        cover_image: desarrollo.cover_image || undefined,
        logo: desarrollo.logo || undefined,
        amenidades: desarrollo.amenidades || null,
        user_id: desarrollo.user_id || '',
        total_unidades: desarrollo.total_unidades || 0,
        unidades_disponibles: Math.min(
          desarrollo.unidades_disponibles || 0,
          desarrollo.total_unidades || 0
        ),
        avance_porcentaje: desarrollo.total_unidades 
          ? Math.round(((desarrollo.total_unidades - (desarrollo.unidades_disponibles || 0)) / desarrollo.total_unidades) * 100)
          : 0,
        comision_operador: desarrollo.comision_operador || 0,
        moneda: desarrollo.moneda || 'MXN',
        fecha_entrega: desarrollo.fecha_entrega || null,
        adr_base: desarrollo.adr_base || 0,
        ocupacion_anual: desarrollo.ocupacion_anual || 0,
        es_impuestos_porcentaje: desarrollo.es_impuestos_porcentaje || false,
        impuestos: desarrollo.impuestos || 0,
        es_gastos_variables_porcentaje: desarrollo.es_gastos_variables_porcentaje || false,
        gastos_variables: desarrollo.gastos_variables || 0,
        gastos_fijos: desarrollo.gastos_fijos || 0,
        es_gastos_fijos_porcentaje: desarrollo.es_gastos_fijos_porcentaje || false,
        es_mantenimiento_porcentaje: desarrollo.es_mantenimiento_porcentaje || false,
        mantenimiento_valor: desarrollo.mantenimiento_valor || 0,
        imagen_url: desarrollo.imagen_url || null
      };
      
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
