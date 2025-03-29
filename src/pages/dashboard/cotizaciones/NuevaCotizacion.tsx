
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const NuevaCotizacion = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simular una carga más rápida de datos iniciales
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
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
  
  // Valores predeterminados para la nueva cotización
  const defaultValues = {
    monto_anticipo: 0,
    monto_finiquito: 0,
    isExistingClient: false,  // Explícitamente configurado para crear un nuevo cliente
    numero_pagos: 12
  };
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
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
