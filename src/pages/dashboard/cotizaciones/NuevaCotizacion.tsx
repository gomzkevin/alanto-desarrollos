
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCotizacionDialog from '@/components/dashboard/AdminCotizacionDialog';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RequireSubscription from '@/components/auth/RequireSubscription';

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
    <RequireSubscription 
      moduleName="Cotizaciones"
      loadingFallback={
        <DashboardLayout>
          <div className="space-y-4 p-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <div className="grid gap-4">
              <Skeleton className="h-72 w-full rounded-xl" />
            </div>
          </div>
        </DashboardLayout>
      }
      unauthorizedFallback={
        <DashboardLayout>
          <div className="p-6">
            <Alert variant="destructive" className="border-2 border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-800 font-semibold text-lg">Acceso restringido</AlertTitle>
              <AlertDescription className="text-red-700">
                No tienes acceso al módulo de Cotizaciones. Por favor, contacta al administrador o verifica que tu empresa tenga una suscripción activa.
              </AlertDescription>
            </Alert>
          </div>
        </DashboardLayout>
      }
    >
      <AdminCotizacionDialog
        open={isDialogOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </RequireSubscription>
  );
};

export default NuevaCotizacion;
