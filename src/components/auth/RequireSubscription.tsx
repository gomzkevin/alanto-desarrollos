
import React, { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import { useUserRole } from '@/hooks/useUserRole';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Componente simplificado que ahora solo verifica que el usuario tenga 
 * un rol válido (admin o vendedor) y una empresa asignada
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard',
  loadingFallback,
  unauthorizedFallback
}) => {
  const { userId, empresaId, isAdmin } = useUserRole();
  
  // Logs para depuración
  useEffect(() => {
    console.log(`RequireSubscription (${moduleName}) - User data:`, {
      userId,
      empresaId,
      isAdmin: isAdmin()
    });
  }, [userId, empresaId, moduleName, isAdmin]);
  
  // Usar el hook modificado de autorización
  const { isAuthorized, isLoading } = useSubscriptionAuth({
    redirectPath: redirectTo
  });
  
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
