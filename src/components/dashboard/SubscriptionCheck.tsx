
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscriptionInfo } from '@/hooks/useSubscriptionInfo';
import { useUserRole } from '@/hooks/useUserRole';
import SubscriptionRequiredDialog from './configuracion/SubscriptionRequiredDialog';

export function SubscriptionCheck({ children }: { children: React.ReactNode }) {
  const { subscriptionInfo, isLoading } = useSubscriptionInfo();
  const { isAdmin, userId, empresaId } = useUserRole();
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
    // 4. Tenemos un empresaId (la empresa existe)
    // 5. No estamos en una ruta exenta
    if (!isLoading && userId && isAdmin() && empresaId && !isExemptRoute) {
      if (!subscriptionInfo.isActive) {
        console.log('No hay suscripción activa para la empresa, redirigiendo a configuración');
        // Mostrar el diálogo y redirigir
        setShowDialog(true);
        navigate('/dashboard/configuracion');
      }
    }
  }, [isLoading, userId, empresaId, subscriptionInfo.isActive, isAdmin, isExemptRoute, navigate]);
  
  // Si es una ruta exenta, no es admin, o es admin con suscripción activa, mostrar el contenido normal
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
