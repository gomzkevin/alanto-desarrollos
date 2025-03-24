
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Component that ensures the user is authenticated before rendering children
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { userId, isLoading, authChecked } = useUserRole();
  const location = useLocation();

  // Show loading state
  if (isLoading || !authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userId) {
    console.log('Usuario no autenticado, redirigiendo a /auth');
    // Pass the current location to the login page so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default RequireAuth;
