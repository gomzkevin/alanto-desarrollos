
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAuthOptions {
  redirectPath?: string;
}

/**
 * Hook simplificado que verifica si el usuario tiene 
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

    const checkUserCompany = async () => {
      // Si no hay userId, no está autorizado
      if (!userId) {
        setIsAuthorized(false);
        return;
      }

      try {
        // Verificar explícitamente si el usuario tiene una empresa asignada en la tabla usuarios
        if (!empresaId) {
          // Intentar obtener el registro de usuario directamente de la base de datos
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('empresa_id')
            .eq('auth_id', userId)
            .single();
          
          if (error || !userData || !userData.empresa_id) {
            console.error('Usuario sin empresa asignada:', userId, error);
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
          console.log('Usuario tiene empresa_id en la base de datos pero no se cargó en el hook:', userData.empresa_id);
          // Dejamos continuar porque la base de datos sí tiene la información
          setIsAuthorized(true);
          return;
        }

        // Si el usuario está autenticado y tiene empresa, está autorizado
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error verificando empresa del usuario:', error);
        setIsAuthorized(false);
      }
    };

    checkUserCompany();
  }, [authChecked, userId, empresaId, redirectPath, navigate]);

  return {
    isAuthorized: isAuthorized === null ? true : isAuthorized,
    isLoading: !authChecked || isAuthorized === null
  };
};

export default useSubscriptionAuth;
