
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

export interface SubscriptionAuthOptions {
  redirectPath?: string;
}

/**
 * Hook simplificado que solo verifica si el usuario tiene 
 * una empresa asignada y un rol válido (admin/vendedor)
 */
export const useSubscriptionAuth = (options: SubscriptionAuthOptions = {}) => {
  const { redirectPath = '/dashboard' } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { userId, empresaId, authChecked } = useUserRole();
  
  // Efecto para verificar autorización básica
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    // Si no hay userId, no está autorizado
    if (!userId) {
      setIsAuthorized(false);
      return;
    }

    // Verificar que el usuario tenga una empresa asignada
    if (!empresaId) {
      toast({
        title: "Sin acceso",
        description: "No tienes una empresa asignada. Contacta al administrador.",
        variant: "destructive"
      });
      navigate(redirectPath);
      setIsAuthorized(false);
      return;
    }

    // Si el usuario está autenticado y tiene empresa, está autorizado
    setIsAuthorized(true);
  }, [authChecked, userId, empresaId, redirectPath, navigate]);

  return {
    isAuthorized: isAuthorized === null ? true : isAuthorized,
    isLoading: !authChecked || isAuthorized === null
  };
};

export default useSubscriptionAuth;
