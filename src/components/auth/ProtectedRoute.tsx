
import React from 'react';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useSubscriptionAuth } from '@/hooks/useSubscriptionAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: string;
  redirectPath?: string;
  bypassAdmin?: boolean;
  showAlert?: boolean;
}

/**
 * Componente para proteger rutas que requieren suscripción activa
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredModule,
  redirectPath = '/dashboard',
  bypassAdmin = true,
  showAlert = true
}) => {
  const { isAuthorized, isLoading } = useSubscriptionAuth(
    requiredModule,
    redirectPath,
    bypassAdmin
  );

  // Mientras se verifica la autorización, mostrar un skeleton loader
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

  // Si no está autorizado y queremos mostrar una alerta en lugar de redirigir
  if (!isAuthorized && showAlert) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>
            {requiredModule 
              ? `No tienes acceso al módulo de ${requiredModule}. Por favor, contacta al administrador o verifica que tu empresa tenga una suscripción activa.`
              : 'No tienes acceso a esta sección. Por favor, contacta al administrador o verifica que tu empresa tenga una suscripción activa.'}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  // Si está autorizado, renderizar el contenido hijo
  return isAuthorized ? <>{children}</> : <Navigate to={redirectPath} replace />;
};

export default ProtectedRoute;
