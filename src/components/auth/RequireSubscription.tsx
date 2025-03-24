
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useUserRole } from '@/hooks/useUserRole';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Component that ensures the user has an active subscription to access the content
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard/configuracion',
  loadingFallback,
  unauthorizedFallback
}) => {
  const { isAuthorized, isLoading } = useSubscriptionAuth(moduleName, redirectTo);
  const { isAdmin } = useUserRole();

  // Show loading state
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

  // Handle unauthorized access
  if (!isAuthorized) {
    if (unauthorizedFallback) return <>{unauthorizedFallback}</>;
    
    // Mensaje personalizado según el rol
    const message = isAdmin() 
      ? `No tienes acceso al módulo de ${moduleName}. Por favor, verifica que tu empresa tenga una suscripción activa.`
      : `No tienes acceso al módulo de ${moduleName}. La empresa necesita una suscripción activa. Por favor, contacta al administrador de tu empresa.`;
    
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acceso restringido</AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // Render children if authorized
  return <>{children}</>;
};

export default RequireSubscription;
