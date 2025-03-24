
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { userId, authChecked, isLoading } = useUserRole();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Reset the redirect attempt flag when location changes
    setRedirectAttempted(false);
    setShouldRedirect(false);
  }, [location.pathname]);

  // Only check auth status when we have a definitive answer
  useEffect(() => {
    if (!isLoading && authChecked && !userId && !redirectAttempted) {
      console.log("Usuario no autenticado, redirigiendo a /auth");
      setRedirectAttempted(true);
      
      // Use a timeout to avoid excessive history.replaceState() calls
      const timer = setTimeout(() => {
        setShouldRedirect(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [userId, authChecked, isLoading, redirectAttempted, location.pathname]);

  // Only return the Navigate component when shouldRedirect is true
  if (shouldRedirect) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still loading or authenticated, render children
  return <>{children}</>;
}
