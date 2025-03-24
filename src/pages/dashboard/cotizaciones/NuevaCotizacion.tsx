
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
  
  return (
    <AdminCotizacionDialog
      open={isDialogOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default NuevaCotizacion;
