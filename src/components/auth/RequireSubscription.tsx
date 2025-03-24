
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { useUserRole } from '@/hooks/useUserRole';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Componente que asegura que la empresa del usuario tiene una suscripción activa
 * Versión optimizada: Usa la nueva función SQL para verificar suscripciones
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard',
  loadingFallback,
  unauthorizedFallback
}) => {
  const { userId, empresaId, userRole } = useUserRole();
  
  // Agregar logs para depurar la carga de datos del usuario
  useEffect(() => {
    console.log(`RequireSubscription for ${moduleName} - User data:`, {
      userId,
      empresaId,
      userRole
    });
  }, [userId, empresaId, userRole, moduleName]);
  
  // Usar el hook de acceso a suscripciones - versión simplificada
  const { isAuthorized, isLoading, subscription } = useSubscriptionAccess({
    requiresSubscription: true,
    requiredModule: moduleName,
    redirectPath: redirectTo
  });
  
  // Console logs para depuración
  useEffect(() => {
    console.log(`RequireSubscription (${moduleName}) - subscription status:`, {
      isActive: subscription?.isActive,
      planName: subscription?.currentPlan?.name,
      empresa: subscription?.empresa_id,
      userId
    });
    console.log(`RequireSubscription (${moduleName}) - isAuthorized:`, isAuthorized);
    console.log(`RequireSubscription (${moduleName}) - isLoading:`, isLoading);
  }, [isAuthorized, isLoading, subscription, moduleName, userId]);

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
