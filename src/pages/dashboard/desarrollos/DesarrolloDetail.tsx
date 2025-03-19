
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedDesarrollo } from '@/hooks/useDesarrollos';
import { useDesarrolloStats, useDesarrolloImagenes } from '@/hooks';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { ChevronLeft, Plus, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DesarrolloCard from '@/components/dashboard/DesarrolloCard';
import DesarrolloEditButton from '@/components/dashboard/DesarrolloEditButton';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import PrototipoCard from '@/components/dashboard/PrototipoCard';
import { useToast } from '@/hooks/use-toast';
import usePrototipos from '@/hooks/usePrototipos';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';

function DesarrolloDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [openAddPrototipoDialog, setOpenAddPrototipoDialog] = useState(false);
  
  // Fetch desarrollo data
  const { 
    data: desarrollo, 
    isLoading, 
    error,
    refetch: refetchDesarrollo 
  } = useQuery({
    queryKey: ['desarrollo', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('desarrollos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as ExtendedDesarrollo;
    },
  });

  // Get desarrollo images
  const { 
    images,
    isLoading: imagesLoading,
    error: imagesError, 
    refetch: refetchImages,
    uploadImage
  } = useDesarrolloImagenes(id);

  // Buscar la imagen principal
  const principal = React.useMemo(() => {
    return images ? images.find(img => img.es_principal) : undefined;
  }, [images]);

  // Get estadísticas del desarrollo
  const { 
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useDesarrolloStats(id);

  // Get prototipos for this desarrollo
  const {
    prototipos,
    isLoading: prototiposLoading,
    error: prototiposError,
    refetch: refetchPrototipos
  } = usePrototipos({ desarrolloId: id, withDesarrollo: false });

  const handleBack = () => {
    navigate('/dashboard/desarrollos');
  };

  const handleRefresh = () => {
    refetchDesarrollo();
    refetchImages();
    refetchStats();
    refetchPrototipos();
  };

  const handlePrototipoSuccess = () => {
    refetchPrototipos();
    refetchStats();
    refetchDesarrollo();
    setOpenAddPrototipoDialog(false);
  };

  // Calculate total units from prototipos
  const totalUnitasEnPrototipos = React.useMemo(() => {
    if (!prototipos) return 0;
    return prototipos.reduce((sum, prototipo) => sum + (prototipo.total_unidades || 0), 0);
  }, [prototipos]);

  // Check if we can add more prototipos
  const canAddPrototipo = React.useMemo(() => {
    if (!desarrollo || !desarrollo.total_unidades) return false;
    return totalUnitasEnPrototipos < desarrollo.total_unidades;
  }, [desarrollo, totalUnitasEnPrototipos]);

  // Calculate remaining units
  const unidadesDisponiblesParaPrototipos = React.useMemo(() => {
    if (!desarrollo || !desarrollo.total_unidades) return 0;
    return desarrollo.total_unidades - totalUnitasEnPrototipos;
  }, [desarrollo, totalUnitasEnPrototipos]);

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

  if (error || !desarrollo) {
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
              No se pudo cargar la información del desarrollo.
              {error && <p className="mt-2">{(error as Error).message}</p>}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRefresh}
          >
            Intentar de nuevo
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 pb-24">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center gap-2">
            <DesarrolloEditButton 
              desarrollo={desarrollo} 
              onSuccess={handleRefresh} 
            />
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <DesarrolloCard 
              desarrollo={desarrollo} 
              onViewDetails={() => {}} 
            />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Prototipos disponibles</CardTitle>
                {canAddPrototipo && (
                  <Button 
                    onClick={() => setOpenAddPrototipoDialog(true)}
                    variant="outline" 
                    size="sm"
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Añadir prototipo {unidadesDisponiblesParaPrototipos > 0 && `(${unidadesDisponiblesParaPrototipos} unidades disponibles)`}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {prototiposLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin h-10 w-10 rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-3 text-lg text-slate-600">Cargando prototipos...</span>
                  </div>
                ) : prototipos && prototipos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prototipos.map((prototipo) => (
                      <PrototipoCard 
                        key={prototipo.id} 
                        prototipo={prototipo} 
                        onViewDetails={(id) => navigate(`/dashboard/prototipos/${id}`)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium">No hay prototipos registrados</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Añade prototipos para este desarrollo para crear unidades.
                    </p>
                    {canAddPrototipo && (
                      <Button onClick={() => setOpenAddPrototipoDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Añadir prototipo
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <DesarrolloImageCarousel 
              desarrolloId={id || ''} 
              editable={true}
            />
            
            {/* Additional info or components can go here */}
          </div>
        </div>
      </div>
      
      {/* Add Prototipo Dialog */}
      <AdminResourceDialog
        resourceType="prototipos"
        open={openAddPrototipoDialog}
        onClose={() => setOpenAddPrototipoDialog(false)}
        onSuccess={handlePrototipoSuccess}
        desarrolloId={id}
      />
    </DashboardLayout>
  );
}

export default DesarrolloDetail;
