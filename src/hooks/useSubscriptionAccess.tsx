
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionAccessOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

interface SubscriptionStatus {
  isActive: boolean;
  currentPlan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features: any;
  } | null;
  renewalDate: string | null;
  empresa_id?: number;
}

/**
 * Hook centralizado que gestiona autorización de acceso basado en suscripciones
 * Versión optimizada: Usa función SQL de Supabase para determinar el estado de suscripción directamente
 */
export const useSubscriptionAccess = (options: SubscriptionAccessOptions = {}) => {
  const { 
    requiresSubscription = false, 
    requiredModule, 
    redirectPath = '/dashboard' 
  } = options;
  
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const { userId, userRole, isAdmin, isSuperAdmin, authChecked, isLoading: isUserLoading } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para obtener el estado de suscripción directamente desde Supabase
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId || !authChecked) return;
      
      try {
        setIsLoading(true);
        console.log('Verificando suscripción para usuario:', userId);
        
        // Si es superadmin, siempre está autorizado
        if (isSuperAdmin()) {
          console.log('Usuario es superadmin - acceso autorizado globalmente');
          setIsAuthorized(true);
          setSubscription({
            isActive: true,
            currentPlan: null,
            renewalDate: null
          });
          return;
        }
        
        // Usar la función de Supabase para obtener el estado de suscripción
        const { data, error } = await supabase
          .rpc('get_user_subscription_status', { user_uuid: userId });
        
        if (error) {
          console.error('Error al obtener estado de suscripción:', error);
          setIsAuthorized(false);
          return;
        }
        
        console.log('Estado de suscripción recibido:', data);
        setSubscription(data as SubscriptionStatus);
        
        // Si el módulo no requiere suscripción, autorizar automáticamente
        if (!requiresSubscription) {
          setIsAuthorized(true);
          return;
        }
        
        // Si tiene suscripción activa, está autorizado
        if (data.isActive) {
          console.log('Suscripción activa encontrada - acceso autorizado');
          setIsAuthorized(true);
          return;
        }
        
        // Sin suscripción activa - denegar acceso si se requiere
        console.log('Sin suscripción activa - acceso denegado');
        
        // Mostrar mensaje sólo si se requiere suscripción
        if (requiresSubscription) {
          // Mensaje específico según si es admin o no
          let message = isAdmin() 
            ? "Tu empresa no tiene una suscripción activa. Por favor, activa la suscripción en configuración."
            : "Tu empresa no tiene una suscripción activa. Por favor, contacta al administrador.";
            
          const moduleText = requiredModule ? ` al módulo ${requiredModule}` : '';
          
          toast({
            title: "Suscripción requerida",
            description: `No tienes acceso${moduleText}. ${message}`,
            variant: "destructive"
          });
          
          // Redirigir a admins a la página de configuración, a otros usuarios al dashboard
          const redirectTo = isAdmin() ? '/dashboard/configuracion' : redirectPath;
          navigate(redirectTo);
        }
        
        setIsAuthorized(false);
      } catch (err) {
        console.error('Error inesperado en verificación de suscripción:', err);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [userId, authChecked, requiresSubscription, requiredModule, redirectPath, isAdmin, isSuperAdmin, navigate]);

  return {
    isAuthorized,
    isLoading: isLoading || isUserLoading || !authChecked || isAuthorized === null,
    subscription
  };
};

export default useSubscriptionAccess;
