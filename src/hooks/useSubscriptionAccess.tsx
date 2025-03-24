
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SubscriptionAccessOptions {
  requiresSubscription?: boolean;
  requiredModule?: string;
  redirectPath?: string;
}

export interface SubscriptionStatus {
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
  const { userId, userRole, isAdmin, isSuperAdmin, authChecked, isLoading: isUserLoading, empresaId } = useUserRole();
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para obtener el estado de suscripción directamente desde Supabase
  useEffect(() => {
    const checkSubscription = async () => {
      if (!userId || !authChecked) return;
      
      try {
        setIsLoading(true);
        console.log('Verificando suscripción para usuario:', userId);
        console.log('Rol del usuario:', userRole);
        console.log('Es admin:', isAdmin());
        console.log('Es superadmin:', isSuperAdmin());
        console.log('Empresa ID:', empresaId);
        
        // Si es superadmin, siempre está autorizado
        if (isSuperAdmin()) {
          console.log('Usuario es superadmin - acceso autorizado globalmente');
          setIsAuthorized(true);
          setSubscription({
            isActive: true,
            currentPlan: null,
            renewalDate: null
          });
          setIsLoading(false);
          return;
        }
        
        // Si es admin de empresa, también otorgar acceso sin verificar suscripción
        if (isAdmin() && !isSuperAdmin()) {
          console.log('Usuario es admin de empresa - acceso autorizado');
          // Para admins, obtenemos la información de suscripción pero no bloqueamos el acceso
          if (empresaId) {
            try {
              const { data: subData, error: subError } = await supabase
                .rpc('get_user_subscription_status', { user_uuid: userId });
                
              if (!subError && subData) {
                console.log('Datos de suscripción para admin:', subData);
                let currentPlanData = null;
                
                if (subData.currentPlan && typeof subData.currentPlan === 'object' && !Array.isArray(subData.currentPlan)) {
                  currentPlanData = {
                    id: String(subData.currentPlan.id || ''),
                    name: String(subData.currentPlan.name || ''),
                    price: Number(subData.currentPlan.price || 0),
                    interval: String(subData.currentPlan.interval || ''),
                    features: subData.currentPlan.features || {}
                  };
                }
                
                setSubscription({
                  isActive: !!subData.isActive,
                  currentPlan: currentPlanData,
                  renewalDate: subData.renewalDate ? String(subData.renewalDate) : null,
                  empresa_id: typeof subData.empresa_id === 'number' ? subData.empresa_id : undefined
                });
              }
            } catch (e) {
              console.error('Error al obtener datos de suscripción para admin:', e);
            }
          }
          
          // Independientemente de la suscripción, los admins siempre tienen acceso
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Para usuarios regulares, verificar si requiere suscripción
        if (!requiresSubscription) {
          console.log('Módulo no requiere suscripción - acceso autorizado');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }
        
        // Usar la función de Supabase para obtener el estado de suscripción
        const { data, error } = await supabase
          .rpc('get_user_subscription_status', { user_uuid: userId });
        
        if (error) {
          console.error('Error al obtener estado de suscripción:', error);
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }
        
        console.log('Estado de suscripción recibido:', data);
        
        // Validar que data tenga la estructura esperada antes de convertirlo
        if (data && typeof data === 'object' && 'isActive' in data) {
          // Verificar y convertir currentPlan de forma segura
          let currentPlanData = null;
          if (data.currentPlan && typeof data.currentPlan === 'object') {
            // Verificar que currentPlan no sea un array antes de acceder a sus propiedades
            if (!Array.isArray(data.currentPlan)) {
              // Asegurarse de que todos los campos necesarios estén presentes
              currentPlanData = {
                id: String(data.currentPlan.id || ''),
                name: String(data.currentPlan.name || ''),
                price: Number(data.currentPlan.price || 0),
                interval: String(data.currentPlan.interval || ''),
                features: data.currentPlan.features || {}
              };
            }
          }
          
          // Construir objeto SubscriptionStatus con conversiones seguras
          const subscriptionData: SubscriptionStatus = {
            isActive: !!data.isActive,
            currentPlan: currentPlanData,
            renewalDate: data.renewalDate ? String(data.renewalDate) : null,
            empresa_id: typeof data.empresa_id === 'number' ? data.empresa_id : undefined
          };
          
          setSubscription(subscriptionData);
          
          // Si tiene suscripción activa, está autorizado
          if (subscriptionData.isActive) {
            console.log('Suscripción activa encontrada - acceso autorizado');
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }
        } else {
          console.error('Formato de datos de suscripción inválido:', data);
        }
        
        // Sin suscripción activa - denegar acceso si se requiere
        console.log('Sin suscripción activa - acceso denegado');
        
        // Mostrar mensaje solo si se requiere suscripción
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
        setIsLoading(false);
      } catch (err) {
        console.error('Error inesperado en verificación de suscripción:', err);
        setIsAuthorized(false);
        setIsLoading(false);
      }
    };
    
    checkSubscription();
  }, [userId, authChecked, requiresSubscription, requiredModule, redirectPath, isAdmin, isSuperAdmin, navigate, empresaId, userRole]);

  return {
    isAuthorized,
    isLoading: isLoading || isUserLoading || !authChecked || isAuthorized === null,
    subscription
  };
};

export default useSubscriptionAccess;
