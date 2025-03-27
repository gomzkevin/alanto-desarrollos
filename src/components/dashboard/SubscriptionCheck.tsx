
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useUserRole } from '@/hooks/useUserRole';
import SubscriptionRequiredDialog from './configuracion/SubscriptionRequiredDialog';

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  const { isAdmin, userId } = useUserRole();
  const [showDialog, setShowDialog] = useState(false);
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
    // 1. No estamos cargando datos
    // 2. El usuario existe
    // 3. El usuario es administrador (solo admins necesitan suscripción activa)
    // 4. No estamos en una ruta exenta
    if (!isLoading && userId && isAdmin() && !isExemptRoute) {
      if (!subscriptionInfo.isActive) {
        console.log('No hay suscripción activa, redirigiendo a configuración');
        // Mostrar el diálogo o redirigir
        setShowDialog(true);
        navigate('/dashboard/configuracion');
      }
    }
  }, [isLoading, userId, subscriptionInfo.isActive, isAdmin, isExemptRoute, navigate]);
  
  // Si es una ruta exenta o no es admin, mostrar el contenido normal
  if (isExemptRoute || !isAdmin() || (isAdmin() && subscriptionInfo.isActive)) {
    return <>{children}</>;
  }
  
  // Mostrar el diálogo para usuarios admin sin suscripción
  return (
    <>
      {children}
      <SubscriptionRequiredDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

export default SubscriptionCheck;
