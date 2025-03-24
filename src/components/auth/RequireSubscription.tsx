
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  moduleName: string;
  redirectTo?: string;
  loadingFallback?: React.ReactNode;
  unauthorizedFallback?: React.ReactNode;
}

/**
 * Componente que asegura que el usuario tiene una suscripción activa
 * para acceder al contenido, utilizando el hook centralizado useAuth
 */
export const RequireSubscription: React.FC<RequireSubscriptionProps> = ({
  children,
  moduleName,
  redirectTo = '/dashboard',
  loadingFallback,
  unauthorizedFallback
}) => {
  const navigate = useNavigate();
  const { isAuthorized, isLoading } = useAuth({
    requiresSubscription: true,
    requiredModule: moduleName,
    redirectPath: redirectTo
  });
  
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle unauthorized access with debounce
  useEffect(() => {
    if (!isLoading && !isAuthorized && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      
      // Prevent multiple redirects
      if (!redirectInProgress) {
        setRedirectInProgress(true);
        
        // Use timeout with increased delay to prevent rapid navigation
        timeoutRef.current = setTimeout(() => {
          navigate(redirectTo);
        }, 500);
      }
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [isAuthorized, isLoading, navigate, redirectTo, redirectInProgress]);

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
              No tienes acceso al módulo de {moduleName}. Por favor, contacta al administrador para activar la suscripción.
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
