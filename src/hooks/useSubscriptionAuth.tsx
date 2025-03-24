
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAuthOptions {
  redirectPath?: string;
  maxRetries?: number;
}

/**
 * Hook mejorado que verifica si el usuario tiene 
 * una empresa asignada y un rol válido
 */
export const useSubscriptionAuth = (options: SubscriptionAuthOptions = {}) => {
  const { redirectPath = '/dashboard', maxRetries = 5 } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { userId, empresaId, authChecked, isLoading: isUserLoading } = useUserRole();
  
  // Efecto para verificar autorización básica
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    const checkUserCompany = async () => {
      // Si no hay userId, no está autorizado
      if (!userId) {
        console.log('No hay userId, usuario no autorizado');
        setIsAuthorized(false);
        return;
      }

      try {
        // Si ya tenemos un empresaId, el usuario está autorizado
        if (empresaId) {
          console.log('Usuario tiene empresaId asignado:', empresaId);
          setIsAuthorized(true);
          return;
        }
        
        // Si no tenemos empresaId pero hemos intentado max veces, mostramos error
        if (retryCount >= maxRetries) {
          console.error('Máximo número de intentos alcanzado. No se pudo obtener empresa_id');
          toast({
            title: "Sin acceso",
            description: "No tienes una empresa asignada. Contacta al administrador.",
            variant: "destructive"
          });
          navigate(redirectPath);
          setIsAuthorized(false);
          return;
        }

        // Verificar explícitamente si el usuario tiene una empresa asignada en la tabla usuarios
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('empresa_id, rol')
          .eq('auth_id', userId)
          .single();
        
        console.log('Verificación directa de empresa_id:', userData, error);
          
        if (error) {
          console.error('Error al verificar empresa del usuario:', error);
          // Incrementar contador y volver a intentar
          setRetryCount(prev => prev + 1);
          // Dejamos continuar temporalmente
          setIsAuthorized(true);
          return;
        }
          
        if (!userData || !userData.empresa_id) {
          console.error('Usuario sin empresa asignada:', userId);
          toast({
            title: "Sin acceso",
            description: "No tienes una empresa asignada. Contacta al administrador.",
            variant: "destructive"
          });
          navigate(redirectPath);
          setIsAuthorized(false);
          return;
        }
        
        // Si llegamos aquí, significa que la base de datos tiene un empresa_id pero no se cargó correctamente
        console.log('Usuario tiene empresa_id en la base de datos:', userData.empresa_id);
        // Autorizar porque la base de datos tiene la información
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error verificando empresa del usuario:', error);
        // Incrementar contador y volver a intentar
        setRetryCount(prev => prev + 1);
        setIsAuthorized(false);
      }
    };

    checkUserCompany();
  }, [authChecked, userId, empresaId, redirectPath, navigate, retryCount, maxRetries]);

  return {
    isAuthorized: isAuthorized === null ? true : isAuthorized,
    isLoading: !authChecked || isAuthorized === null || isUserLoading
  };
};

export default useSubscriptionAuth;
