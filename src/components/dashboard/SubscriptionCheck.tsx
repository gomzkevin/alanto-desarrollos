
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
    desarrollos: boolean;
    prototipos: boolean;
    vendedores: boolean;
  }>({
    noSubscription: false,
    desarrollos: false,
    prototipos: false,
    vendedores: false
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
        noSubscription: false,
        desarrollos: false,
        prototipos: false,
        vendedores: false
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
      
      // Verificar los límites del plan y mostrar avisos informativos
      if (subscriptionInfo.isActive) {
        // Verificar límites de desarrollos
        if (subscriptionInfo.desarrolloLimit !== undefined && 
            subscriptionInfo.desarrolloCount !== undefined && 
            subscriptionInfo.desarrolloCount >= subscriptionInfo.desarrolloLimit &&
            !notificationsShown.current.desarrollos) {
          
          const isExceeded = subscriptionInfo.desarrolloCount > subscriptionInfo.desarrolloLimit;
          
          toast({
            title: isExceeded ? "Límite de desarrollos excedido" : "Límite de desarrollos alcanzado",
            description: `${isExceeded ? 'Has excedido' : 'Has alcanzado'} el límite de ${subscriptionInfo.desarrolloLimit} desarrollos de tu plan (${subscriptionInfo.desarrolloCount}/${subscriptionInfo.desarrolloLimit}). Actualiza tu suscripción para ${isExceeded ? 'evitar restricciones' : 'añadir más'}.`,
            variant: "warning",
          });
          notificationsShown.current.desarrollos = true;
        }
        
        // Verificar límites de prototipos
        if (subscriptionInfo.prototipoLimit !== undefined && 
            subscriptionInfo.prototipoCount !== undefined && 
            subscriptionInfo.prototipoCount >= subscriptionInfo.prototipoLimit &&
            !notificationsShown.current.prototipos) {
          
          const isExceeded = subscriptionInfo.prototipoCount > subscriptionInfo.prototipoLimit;
          
          toast({
            title: isExceeded ? "Límite de prototipos excedido" : "Límite de prototipos alcanzado",
            description: `${isExceeded ? 'Has excedido' : 'Has alcanzado'} el límite de ${subscriptionInfo.prototipoLimit} prototipos de tu plan (${subscriptionInfo.prototipoCount}/${subscriptionInfo.prototipoLimit}). Actualiza tu suscripción para ${isExceeded ? 'evitar restricciones' : 'añadir más'}.`,
            variant: "warning",
          });
          notificationsShown.current.prototipos = true;
        }
        
        // Verificar límites de vendedores
        if (subscriptionInfo.vendorLimit !== undefined && 
            subscriptionInfo.vendorCount !== undefined && 
            subscriptionInfo.vendorCount >= subscriptionInfo.vendorLimit &&
            !notificationsShown.current.vendedores) {
          
          const isExceeded = subscriptionInfo.vendorCount > subscriptionInfo.vendorLimit;
          
          toast({
            title: isExceeded ? "Límite de vendedores excedido" : "Límite de vendedores alcanzado",
            description: `${isExceeded ? 'Has excedido' : 'Has alcanzado'} el límite de ${subscriptionInfo.vendorLimit} vendedores de tu plan (${subscriptionInfo.vendorCount}/${subscriptionInfo.vendorLimit}). Actualiza tu suscripción para ${isExceeded ? 'evitar restricciones' : 'añadir más'}.`,
            variant: "warning",
          });
          notificationsShown.current.vendedores = true;
        }
      }
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
