
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(true);
  
  // Obtener parámetros de la URL si existen
  const searchParams = new URLSearchParams(location.search);
  const unidadId = searchParams.get('unidad');
  const prototipoId = searchParams.get('prototipo');
  const desarrolloId = searchParams.get('desarrollo');
  
  // Valores predeterminados para la cotización
  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({});
  
  // Efecto para obtener información de la unidad si existe el ID
  useEffect(() => {
    const fetchUnidadData = async () => {
      if (!unidadId) return;
      
      try {
        // Aquí normalmente se cargarían los datos de la unidad desde Supabase
        // Por ahora, solo establecemos el prototipo_id si existe en la URL
        if (prototipoId) {
          setDefaultValues(prev => ({
            ...prev,
            prototipo_id: prototipoId
          }));
        }
        
        if (desarrolloId) {
          setDefaultValues(prev => ({
            ...prev,
            desarrollo_id: desarrolloId
          }));
        }
      } catch (error) {
        console.error('Error al cargar datos de la unidad:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos de la unidad',
          variant: 'destructive',
        });
      }
    };
    
    fetchUnidadData();
  }, [unidadId, prototipoId, desarrolloId, toast]);
  
  // Cuando se cierra el diálogo, regresar a la lista de cotizaciones o a la página anterior
  const handleDialogClose = () => {
    setDialogOpen(false);
    
    // Si venimos de una unidad, regresamos a la página de prototipos
    if (unidadId || prototipoId) {
      navigate(-1);
    } else {
      navigate('/dashboard/cotizaciones');
    }
  };
  
  // Cuando se guarda la cotización, regresar a la lista
  const handleSuccess = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 pb-16">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">Nueva Cotización</h1>
          </div>
          <p className="text-slate-600">Crea una nueva cotización para un cliente</p>
        </div>
        
        {/* Mostrar el diálogo de recurso */}
        <AdminResourceDialog
          resourceType="cotizaciones"
          open={dialogOpen}
          onClose={handleDialogClose}
          onSuccess={handleSuccess}
          buttonText="Nueva Cotización"
          desarrolloId={desarrolloId || undefined}
          prototipo_id={prototipoId || undefined}
          defaultValues={defaultValues}
        />
      </div>
    </DashboardLayout>
  );
}
