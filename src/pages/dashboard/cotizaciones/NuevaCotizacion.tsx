
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
    <ProtectedRoute requiredModule="Cotizaciones">
      <AdminCotizacionDialog
        open={isDialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </ProtectedRoute>
  );
};

export default NuevaCotizacion;
