
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AdminResourceDialog from '@/components/dashboard/ResourceDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(true);
  
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
        />
      </div>
    </DashboardLayout>
  );
}
