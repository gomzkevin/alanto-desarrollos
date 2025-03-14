
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import useDesarrollos from '@/hooks/useDesarrollos';
import DesarrolloCard from '@/components/dashboard/DesarrolloCard';
import AdminResourceDialog from '@/components/dashboard/AdminResourceDialog';
import useUserRole from '@/hooks/useUserRole';
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;

const DesarrollosPage = () => {
  const navigate = useNavigate();
  
  const { 
    desarrollos = [], 
    isLoading, 
    error,
    refetch 
  } = useDesarrollos();

  const { canCreateResource } = useUserRole();

  const handleDesarrolloClick = (id: string) => {
    navigate(`/dashboard/desarrollos/${id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-800">Desarrollos Inmobiliarios</h1>
            <p className="text-slate-600">Gestiona y monitorea tus desarrollos inmobiliarios</p>
          </div>
          
          <AdminResourceDialog 
            resourceType="desarrollos" 
            buttonText="Nuevo desarrollo" 
            onSuccess={refetch}
            open={false}
            onClose={() => {}}
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
            {(desarrollos as Desarrollo[]).map((desarrollo) => (
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
