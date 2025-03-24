
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

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
  const { empresaId, userId, userRole, isAdmin, isSuperAdmin } = useUserRole();
  
  // Agregar logs para depurar la carga de datos del usuario
  useEffect(() => {
    console.log(`RequireSubscription for ${moduleName} - User data:`, {
      userId,
      empresaId,
      userRole,
      isAdmin: isAdmin(),
      isSuperAdmin: isSuperAdmin()
    });
  }, [userId, empresaId, userRole, moduleName, isAdmin, isSuperAdmin]);
  
  // Usar el hook central de suscripciones
  const { isAuthorized, isLoading, subscription, error } = useSubscription({
    requiresSubscription: true,
    requiredModule: moduleName,
    redirectPath: redirectTo
  });
  
  // Console logs para depuración
  useEffect(() => {
    console.log(`RequireSubscription (${moduleName}) - subscription info:`, {
      isActive: subscription?.isActive,
      planName: subscription?.currentPlan?.name,
      error
    });
    console.log(`RequireSubscription (${moduleName}) - isAuthorized:`, isAuthorized);
    console.log(`RequireSubscription (${moduleName}) - isLoading:`, isLoading);
    
    // Mostrar toast informativo cuando hay error en consulta de suscripción
    if (error) {
      console.error(`RequireSubscription (${moduleName}) - Error:`, error);
      toast({
        title: "Error al verificar suscripción",
        description: "Hubo un problema al verificar el estado de tu suscripción. Por favor, intenta de nuevo más tarde.",
        variant: "destructive"
      });
    }
  }, [isAuthorized, isLoading, subscription, error, moduleName]);

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
