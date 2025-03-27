
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useUserRole } from '@/hooks/useUserRole';

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
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
    // 4. El usuario es administrador (solo admins necesitan suscripción activa)
    // 5. Tenemos un empresaId (la empresa existe)
    // 6. No estamos en una ruta exenta
    if (!isLoading && authChecked && userId && isAdmin() && empresaId && !isExemptRoute) {
      if (!subscriptionInfo.isActive) {
        console.log('No hay suscripción activa para la empresa, redirigiendo a configuración');
        
        // Solo redirigir si no estamos ya en la página de configuración
        if (!location.pathname.includes('/dashboard/configuracion')) {
          navigate('/dashboard/configuracion', { replace: true });
        }
      }
    }
  }, [isLoading, authChecked, userId, empresaId, subscriptionInfo.isActive, isAdmin, isExemptRoute, navigate, location.pathname]);
  
  // Si es una ruta exenta o no es admin, mostrar el contenido normal
  if (isExemptRoute || !isAdmin()) {
    return <>{children}</>;
  }
  
  // Si es admin y tiene una suscripción activa, mostrar el contenido normal
  if (isAdmin() && subscriptionInfo.isActive) {
    return <>{children}</>;
  }
  
  // En este punto sabemos que:
  // 1. Es un administrador 
  // 2. No tiene suscripción activa
  // 3. No está en una ruta exenta
  // Por lo tanto, no renderizamos nada y dejamos que el efecto redirija
  return null;
}

export default SubscriptionCheck;
