
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
  
  // Set proper numeric values to ensure currency formatting works
  const defaultValues = {
    monto_anticipo: 0,
    monto_finiquito: 0,
    numero_pagos: 0
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
