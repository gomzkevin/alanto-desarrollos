
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';

const NuevaCotizacion = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  
  const handleClose = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  const handleSuccess = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  // Configurar los valores predeterminados para asegurar que se aplica el formato currency
  const defaultValues = {
    monto_anticipo: 0,
    monto_finiquito: 0,
    // otros valores predeterminados si son necesarios
  };
  
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
