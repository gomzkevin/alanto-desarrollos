
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import { useToast } from '@/components/ui/use-toast';

const NuevaCotizacion = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { toast } = useToast();
  
  const handleClose = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  const handleSuccess = () => {
    toast({
      title: 'Cotización creada',
      description: 'La cotización ha sido creada exitosamente.'
    });
    navigate('/dashboard/cotizaciones');
  };
  
  // Configurar los valores predeterminados para asegurar que se aplica el formato currency
  // y para establecer el modo de cliente nuevo como predeterminado
  const defaultValues = {
    monto_anticipo: 0,
    monto_finiquito: 0,
    isExistingClient: false  // Explicitly set to false to default to creating a new client
  };
  
  console.log('NuevaCotizacion: Using defaultValues:', defaultValues);
  
  return (
    <AdminCotizacionDialog
      open={isDialogOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
      defaultValues={defaultValues}
    />
  );
};

export default NuevaCotizacion;
