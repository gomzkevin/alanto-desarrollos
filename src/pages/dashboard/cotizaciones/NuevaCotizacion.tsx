
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(true);
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.search);
  const unidadId = searchParams.get('unidad');
  const prototipoId = searchParams.get('prototipo');
  const desarrolloId = searchParams.get('desarrollo');
  
  // Default values based on URL parameters
  const defaultValues = unidadId ? {
    unidad_id: unidadId
  } : undefined;
  
  // Cuando se cierra el diálogo, regresar a la lista de cotizaciones
  const handleDialogClose = () => {
    setDialogOpen(false);
    navigate('/dashboard/cotizaciones');
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
              onClick={() => navigate('/dashboard/cotizaciones')}
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
