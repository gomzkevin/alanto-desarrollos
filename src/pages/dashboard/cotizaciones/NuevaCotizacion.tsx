
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
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.search);
  const unidadId = searchParams.get('unidad');
  const prototipoId = searchParams.get('prototipo');
  const desarrolloId = searchParams.get('desarrollo');
  
  // Log parameters for debugging
  useEffect(() => {
    console.log('Cotización params:', { unidadId, prototipoId, desarrolloId });
    
    // Validate required parameters
    if (desarrolloId && prototipoId) {
      console.log('Required parameters present');
    } else {
      console.error('Missing required parameters');
      if (!desarrolloId) console.error('No desarrollo_id provided');
      if (!prototipoId) console.error('No prototipo_id provided');
      
      toast({
        title: "Error en parámetros",
        description: "Faltan parámetros necesarios para crear la cotización",
        variant: "destructive"
      });
    }
  }, [unidadId, prototipoId, desarrolloId, toast]);
  
  // Default values based on URL parameters
  const defaultValues = {
    desarrollo_id: desarrolloId || '',
    prototipo_id: prototipoId || '',
    unidad_id: unidadId || ''
  };
  
  // Cuando se cierra el diálogo, regresar a la lista de cotizaciones
  const handleDialogClose = () => {
    setDialogOpen(false);
    navigate('/dashboard/cotizaciones');
  };
  
  // Cuando se guarda la cotización, regresar a la lista
  const handleSuccess = () => {
    toast({
      title: "Cotización creada",
      description: "La cotización ha sido creada exitosamente"
    });
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
              onClick={() => navigate('/dashboard/cotizaciones')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold text-slate-800">Nueva Cotización</h1>
          </div>
          <p className="text-slate-600">Crea una nueva cotización para un cliente</p>
        </div>
        
        {dialogOpen && (
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
        )}
      </div>
    </DashboardLayout>
  );
}
