
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSubscription } from '@/hooks/useSubscription';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Componente que asegura que la empresa del usuario tiene una suscripción activa
 * para acceder al contenido, utilizando el hook centralizado useSubscription
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard',
  loadingFallback,
  unauthorizedFallback
}) => {
  // Usar el hook central de suscripciones
  const { isAuthorized, isLoading } = useSubscription({
    requiresSubscription: true,
    requiredModule: moduleName,
    redirectPath: redirectTo
  });
  
  // Console logs para depuración
  console.log(`RequireSubscription (${moduleName}) - isAuthorized:`, isAuthorized);
  console.log(`RequireSubscription (${moduleName}) - isLoading:`, isLoading);

  // Mostrar estado de carga
  if (isLoading) {
    if (loadingFallback) return <>{loadingFallback}</>;
    
    return (
      <DashboardLayout>
        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <div className="grid gap-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Manejar acceso no autorizado
  if (!isAuthorized) {
    if (unauthorizedFallback) return <>{unauthorizedFallback}</>;
    
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>
              Tu empresa no tiene acceso al módulo de {moduleName}. Por favor, contacta al administrador para activar la suscripción.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Renderizar contenido si está autorizado
  return <>{children}</>;
};

export default RequireSubscription;
