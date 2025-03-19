
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import useDesarrollos from '@/hooks/useDesarrollos';
import DesarrolloCard from '@/components/dashboard/DesarrolloCard';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import useUserRole from '@/hooks/useUserRole';
import { Tables } from '@/integrations/supabase/types';
import useUnidades from '@/hooks/useUnidades';

type Desarrollo = Tables<"desarrollos">;

const DesarrollosPage = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [desarrollosWithRealCounts, setDesarrollosWithRealCounts] = useState<Desarrollo[]>([]);
  
  const { 
    desarrollos = [], 
    isLoading, 
    error,
    refetch 
  } = useDesarrollos();
  
  const { countDesarrolloUnidadesByStatus } = useUnidades();

  const { canCreateResource } = useUserRole();

  useEffect(() => {
    const updateRealUnitCounts = async () => {
      if (desarrollos.length === 0 || isLoading) return;
      
      // For each desarrollo, get the real unit counts from the database
      const updatedDesarrollos = await Promise.all(
        desarrollos.map(async (desarrollo) => {
          try {
            // Get real counts from all units in this desarrollo
            const counts = await countDesarrolloUnidadesByStatus(desarrollo.id);
            
            return {
              ...desarrollo,
              unidades_disponibles: counts.disponibles,
              total_unidades: counts.total || 0 // Handle potentially undefined total
            };
          } catch (error) {
            console.error('Error updating real counts for desarrollo:', desarrollo.id, error);
            return desarrollo;
          }
        })
      );
      
      setDesarrollosWithRealCounts(updatedDesarrollos);
    };
    
    updateRealUnitCounts();
  }, [desarrollos, isLoading]);

  // Function to normalize desarrollo data before display
  const normalizeDesarrollos = (desarrollos: Desarrollo[]): Desarrollo[] => {
    return desarrollos.map(desarrollo => {
      // Ensure unidades_disponibles is not greater than total_unidades
      const normalizedDesarrollo = {
        ...desarrollo,
        unidades_disponibles: Math.min(
          desarrollo.unidades_disponibles || 0,
          desarrollo.total_unidades || 0
        ),
        // Calculate avance_porcentaje based on sold and reserved units
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

  // Use real counts when available, otherwise use normalized desarrollos
  const displayDesarrollos = desarrollosWithRealCounts.length > 0 
    ? normalizeDesarrollos(desarrollosWithRealCounts)
    : normalizeDesarrollos(desarrollos as Desarrollo[]);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Desarrollos Inmobiliarios</h1>
            <p className="text-slate-600">Gestiona y monitorea tus desarrollos inmobiliarios</p>
          </div>
          
          {canCreateResource && (
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
