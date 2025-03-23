
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const NuevaCotizacion = () => {
  // Always call hooks at the top level
  const { isAuthorized, isLoading } = useSubscriptionAuth('Cotizaciones');
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  
  const handleClose = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  const handleSuccess = () => {
    navigate('/dashboard/cotizaciones');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render unauthorized state
  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            No tienes acceso al módulo de Cotizaciones. Por favor, contacta al administrador o verifica que tu empresa tenga una suscripción activa.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }
  
  return (
    <AdminCotizacionDialog
      open={isDialogOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

export default NuevaCotizacion;
