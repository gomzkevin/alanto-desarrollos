
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Componente mejorado que verifica que el usuario esté autenticado
 * y tenga acceso al módulo correspondiente según su suscripción
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard',
  loadingFallback,
  unauthorizedFallback
}) => {
  // Usar el hook de autorización con más reintentos
  const { isAuthorized, isLoading, userId, empresaId } = useSubscriptionAuth({
    redirectPath: redirectTo,
    maxRetries: 5,
    requiredModule: moduleName
  });
  
  // Log para debug
  useEffect(() => {
    console.log(`RequireSubscription (${moduleName}) - Auth status:`, { 
      isAuthorized, 
      isLoading, 
      userId, 
      empresaId 
    });
  }, [isAuthorized, isLoading, userId, empresaId, moduleName]);
  
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

  // Si el usuario está autenticado pero no tiene empresaId, darle acceso temporalmente
  if (!isAuthorized && userId && !empresaId) {
    console.log(`RequireSubscription (${moduleName}) - Usuario ${userId} sin empresa asignada, pero dando acceso temporal`);
    return <>{children}</>;
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
              No tienes acceso al módulo de {moduleName}. Por favor, contacta al administrador.
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
