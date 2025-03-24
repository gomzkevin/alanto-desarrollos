
import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { userId, authChecked, isLoading } = useUserRole();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset the redirect state when location changes
  useEffect(() => {
    redirectAttemptedRef.current = false;
    setShouldRedirect(false);
    
    // Limpiar cualquier timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [location.pathname]);

  // Check auth status only once we have definitive answer
  useEffect(() => {
    if (!isLoading && authChecked && !userId && !redirectAttemptedRef.current) {
      console.log("Usuario no autenticado, redirigiendo a /auth");
      redirectAttemptedRef.current = true;
      
      // Use a timeout to avoid excessive history.replaceState() calls
      // Increase the delay to prevent rapid redirects
      timeoutRef.current = setTimeout(() => {
        setShouldRedirect(true);
      }, 500);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [userId, authChecked, isLoading, location.pathname]);

  // Only return the Navigate component when shouldRedirect is true
  if (shouldRedirect) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still loading or authenticated, render children
  return <>{children}</>;
}
