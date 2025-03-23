
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';

/**
 * Hook para verificar si el usuario tiene acceso basado en suscripción
 * @param requiredModule - Módulo opcional que se intenta acceder (para mensajes específicos)
 * @param redirectPath - Ruta a la que redirigir si no hay acceso (por defecto: /dashboard)
 * @param bypassAdmin - Si los administradores pueden omitir la verificación (por defecto: true)
 */
export const useSubscriptionAuth = (
  requiredModule?: string, 
  redirectPath: string = '/dashboard',
  bypassAdmin: boolean = true
) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { 
    isLoading, 
    canAccess, 
    hasValidEmpresa, 
    isSubscriptionActive 
  } = useSubscription();

  useEffect(() => {
    // Solo verificar cuando tengamos toda la información necesaria
    if (!isLoading) {
      // Verificar acceso utilizando el contexto
      const authorized = canAccess(requiredModule, bypassAdmin);
      
      // Log para debugging
      console.log('Verificando autorización de suscripción:', {
        requiredModule,
        authorized,
        hasValidEmpresa,
        isSubscriptionActive,
        bypassAdmin
      });

      // Si no está autorizado, mostrar mensaje y redirigir
      if (!authorized) {
        // Determinar mensaje específico basado en la causa del rechazo
        if (!hasValidEmpresa) {
          toast({
            title: "Sin acceso",
            description: "No tienes una empresa asignada. Contacta al administrador.",
            variant: "destructive"
          });
        } else if (!isSubscriptionActive) {
          const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
          toast({
            title: "Suscripción requerida",
            description: `No tienes acceso${moduleText}. La empresa necesita una suscripción activa.`,
            variant: "destructive"
          });
        }
        
        // Redirigir a la ruta segura
        navigate(redirectPath);
        setIsAuthorized(false);
        return;
      }

      // Si llegamos aquí, el usuario está autorizado
      setIsAuthorized(true);
    }
  }, [isLoading, canAccess, hasValidEmpresa, isSubscriptionActive, navigate, redirectPath, requiredModule, bypassAdmin]);

  return {
    isAuthorized,
    isLoading: isLoading || isAuthorized === null
  };
};

export default useSubscriptionAuth;
