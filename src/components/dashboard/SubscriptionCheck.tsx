
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
    
    // Solo ejecutar esta lógica si:
    // 1. No estamos cargando datos de suscripción 
    // 2. La autenticación ya se verificó
    // 3. El usuario existe
    // 4. Tenemos un empresaId (la empresa existe)
    // 5. No estamos en una ruta exenta
    if (!subscriptionLoading && authChecked && userId && empresaId && !isExemptRoute) {
      // Verificamos si la empresa no tiene suscripción activa (aplica a cualquier rol)
      if (!subscriptionInfo.isActive && !notificationsShown.current.noSubscription) {
        console.log('No hay suscripción activa para la empresa, redirigiendo a configuración');
        
        // Mostrar mensaje más informativo
        toast({
          title: "Suscripción inactiva",
          description: "Tu empresa no tiene una suscripción activa. Por favor, actualiza tu plan para continuar usando todas las funcionalidades.",
          variant: "destructive",
        });
        
        notificationsShown.current.noSubscription = true;
        
        // Solo redirigir si no estamos ya en la página de configuración
        if (!location.pathname.includes('/dashboard/configuracion')) {
          navigate('/dashboard/configuracion', { replace: true });
        }
      }
      
      // Ya no mostramos las notificaciones de límites alcanzados
      // pero mantenemos la lógica de verificación interna para 
      // que se sigan gestionando correctamente los límites
    }
  }, [subscriptionLoading, authChecked, userId, empresaId, subscriptionInfo, isExemptRoute, navigate, location.pathname]);
  
  // Si es una ruta exenta, mostrar el contenido normal
  if (isExemptRoute) {
    return <>{children}</>;
  }
  
  // Si tiene una suscripción activa, mostrar el contenido normal
  if (subscriptionInfo.isActive) {
    return <>{children}</>;
  }
  
  // Si estamos cargando, mostrar el contenido normal (la redirección se manejará en el efecto)
  if (subscriptionLoading) {
    return <>{children}</>;
  }
  
  // En este punto sabemos que:
  // 1. No tiene suscripción activa
  // 2. No está en una ruta exenta
  // 3. No estamos cargando
  // Por lo tanto, no renderizamos nada y dejamos que el efecto redirija
  return null;
}

export default SubscriptionCheck;
