
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Componente que asegura que el usuario está autenticado antes de renderizar children
 * Utiliza el hook centralizado useAuth
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { userId, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!userId) {
    console.log('Usuario no autenticado, redirigiendo a /auth');
    // Pasar la ubicación actual a la página de login para redirigir después del login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Usuario está autenticado, renderizar children
  return <>{children}</>;
};

export default RequireAuth;
