
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DesarrolloEditButton from '@/components/dashboard/DesarrolloEditButton';
import PrototipoCard from '@/components/dashboard/PrototipoCard';
import PrototipoActions from '@/pages/dashboard/prototipos/components/PrototipoActions';
import DesarrolloImageCarousel from '@/components/dashboard/DesarrolloImageCarousel';
import { useDesarrollos, usePrototipos } from '@/hooks';
import { Tables } from '@/integrations/supabase/types';

type Desarrollo = Tables<"desarrollos">;

const DesarrolloDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [desarrollo, setDesarrollo] = useState<Desarrollo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use hooks to fetch data
  const { fetchDesarrolloById } = useDesarrollos();
  const { prototipos, isLoading: prototiposLoading, refetch: refetchPrototipos } = usePrototipos({
    desarrolloId: id || undefined,
    withDesarrollo: true
  });
  
  // Fetch desarrollo details
  useEffect(() => {
    const loadDesarrollo = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const desarrolloData = await fetchDesarrolloById(id);
        setDesarrollo(desarrolloData);
      } catch (error) {
        console.error('Error loading desarrollo:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDesarrollo();
  }, [id, fetchDesarrolloById]);
  
  const handleBack = () => {
    navigate('/dashboard/desarrollos');
  };
  
  const handlePrototipoAdded = () => {
    refetchPrototipos();
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <div className="animate-pulse space-y-4 mt-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!desarrollo) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <div className="mt-6">
            <p>No se encontró el desarrollo</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          
          <DesarrolloEditButton
            desarrollo={desarrollo}
            onSuccess={() => fetchDesarrolloById(id!).then(setDesarrollo)}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-3">{desarrollo.nombre}</h2>
            <p className="text-muted-foreground mb-6">{desarrollo.descripcion}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Ubicación</h3>
                <p>{desarrollo.ubicacion}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Tipo</h3>
                <p>{desarrollo.tipo || 'No especificado'}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Fecha de inicio</h3>
                <p>{desarrollo.fecha_inicio ? new Date(desarrollo.fecha_inicio).toLocaleDateString() : 'No especificada'}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Fecha de finalización</h3>
                <p>{desarrollo.fecha_fin ? new Date(desarrollo.fecha_fin).toLocaleDateString() : 'No especificada'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <DesarrolloImageCarousel desarrolloId={desarrollo.id} />
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Prototipos</h2>
            <PrototipoActions 
              desarrolloId={id} 
              onPrototipoAdded={handlePrototipoAdded} 
            />
          </div>
          
          {prototiposLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse h-64"></Card>
              ))}
            </div>
          ) : prototipos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prototipos.map(prototipo => (
                <PrototipoCard 
                  key={prototipo.id} 
                  prototipo={prototipo} 
                  onPrototipoSelected={() => navigate(`/dashboard/prototipos/${prototipo.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No hay prototipos para este desarrollo</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DesarrolloDetail;
