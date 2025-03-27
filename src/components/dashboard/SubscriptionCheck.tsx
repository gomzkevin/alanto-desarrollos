
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useUserRole } from '@/hooks/useUserRole';

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { subscriptionInfo, isLoading: subscriptionLoading } = useSubscriptionInfo();
  const { isAdmin, userId, empresaId, authChecked } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rutas que están exentas de la comprobación de suscripción
  const exemptRoutes = [
    '/dashboard/configuracion',
    '/dashboard/configuracion/suscripcion'
  ];
  
  // Verificar si la ruta actual está exenta
  const isExemptRoute = exemptRoutes.some(route => location.pathname.startsWith(route));
  
  useEffect(() => {
    // Solo ejecutar esta lógica si:
    // 1. No estamos cargando datos de suscripción 
    // 2. La autenticación ya se verificó
    // 3. El usuario existe
    // 4. Tenemos un empresaId (la empresa existe)
    // 5. No estamos en una ruta exenta
    if (!subscriptionLoading && authChecked && userId && empresaId && !isExemptRoute) {
      // Verificamos si la empresa no tiene suscripción activa (aplica a cualquier rol)
      if (!subscriptionInfo.isActive) {
        console.log('No hay suscripción activa para la empresa, redirigiendo a configuración');
        
        // Solo redirigir si no estamos ya en la página de configuración
        if (!location.pathname.includes('/dashboard/configuracion')) {
          navigate('/dashboard/configuracion', { replace: true });
        }
      }
    }
  }, [subscriptionLoading, authChecked, userId, empresaId, subscriptionInfo.isActive, isExemptRoute, navigate, location.pathname]);
  
  // Si es una ruta exenta, mostrar el contenido normal
  if (isExemptRoute) {
    return <>{children}</>;
  }
  
  // Si tiene una suscripción activa, mostrar el contenido normal
  if (subscriptionInfo.isActive) {
    return <>{children}</>;
  }
  
  // En este punto sabemos que:
  // 1. No tiene suscripción activa
  // 2. No está en una ruta exenta
  // Por lo tanto, no renderizamos nada y dejamos que el efecto redirija
  return null;
}

export default SubscriptionCheck;
