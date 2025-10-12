
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from '@/components/ui/use-toast';

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  const { isAdmin, userId, empresaId, authChecked } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Referencia para controlar notificaciones mostradas
  const notificationsShown = useRef<{
    noSubscription: boolean;
  }>({
    noSubscription: false
  });
  
  // Guardamos la última ruta para evitar mostrar notificaciones en la misma ruta
  const lastPathRef = useRef<string>(location.pathname);
  
  // Rutas que están exentas de la comprobación de suscripción
  const exemptRoutes = [
    '/dashboard/configuracion',
    '/dashboard/configuracion/suscripcion'
  ];
  
  // Verificar si la ruta actual está exenta
  const isExemptRoute = exemptRoutes.some(route => location.pathname.startsWith(route));
  
  useEffect(() => {
    // Resetear notificaciones cuando cambiamos de ruta
    if (lastPathRef.current !== location.pathname) {
      notificationsShown.current = {
        noSubscription: false
      };
      lastPathRef.current = location.pathname;
    }
  }, [location.pathname]);
  
  // FASE 1: Permitir navegación libre con plan Free
  // Solo renderizar children, sin bloquear navegación
  // El control de features premium se maneja en FeatureGate individual por ruta
  return <>{children}</>;
}

export default SubscriptionCheck;
