
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Unidad = Tables<"unidades">;
type Prototipo = Tables<"prototipos">;

export default function NuevaCotizacionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openCotizacionDialog, setOpenCotizacionDialog] = useState(true);
  const [unidadId, setUnidadId] = useState<string | null>(null);
  const [unidad, setUnidad] = useState<Unidad | null>(null);
  const [prototipo, setPrototipo] = useState<Prototipo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener el ID de la unidad de los parámetros de consulta
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('unidad');
    setUnidadId(id);
    
    if (id) {
      fetchUnidadData(id);
    } else {
      setIsLoading(false);
    }
  }, [location]);

  const fetchUnidadData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Obtener la unidad
      const { data: unidadData, error: unidadError } = await supabase
        .from('unidades')
        .select('*')
        .eq('id', id)
        .single();
      
      if (unidadError) throw unidadError;
      
      setUnidad(unidadData);
      
      // Obtener el prototipo asociado
      if (unidadData.prototipo_id) {
        const { data: prototipoData, error: prototipoError } = await supabase
          .from('prototipos')
          .select('*')
          .eq('id', unidadData.prototipo_id)
          .single();
        
        if (prototipoError) throw prototipoError;
        
        setPrototipo(prototipoData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de la unidad.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpenCotizacionDialog(false);
    // Redirigir de vuelta al detalle del prototipo
    if (prototipo?.id) {
      navigate(`/dashboard/prototipos/${prototipo.id}`);
    } else {
      navigate('/dashboard/cotizaciones');
    }
  };

  const handleSuccess = () => {
    toast({
      title: 'Cotización creada',
      description: 'La cotización ha sido creada exitosamente',
    });
    
    // Invalidar las consultas para actualizar los datos
    queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    
    // Redirigir a la lista de cotizaciones
    navigate('/dashboard/cotizaciones');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} type="button">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Nueva Cotización</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : !unidadId ? (
          <Card>
            <CardHeader>
              <CardTitle>Crear cotización</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Para crear una cotización, seleccione una unidad desde el detalle del prototipo.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setOpenCotizacionDialog(true)}
                type="button"
              >
                Crear cotización manualmente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                Cotización para unidad {unidad?.numero}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unidad && prototipo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium">Prototipo</h3>
                      <p>{prototipo.nombre}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Unidad</h3>
                      <p>{unidad.numero}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Precio</h3>
                      <p>{prototipo.precio.toLocaleString('es-MX', { 
                        style: 'currency', 
                        currency: 'MXN' 
                      })}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Estado</h3>
                      <p className="capitalize">{unidad.estado}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>No se encontraron datos para esta unidad.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo para crear cotización */}
      {openCotizacionDialog && (
        <AdminResourceDialog
          resourceType="cotizaciones"
          open={openCotizacionDialog}
          onClose={handleClose}
          onSuccess={handleSuccess}
          defaultValues={{
            prototipo_id: unidad?.prototipo_id || '',
            desarrollo_id: prototipo?.desarrollo_id || '',
          }}
        />
      )}
    </DashboardLayout>
  );
}
