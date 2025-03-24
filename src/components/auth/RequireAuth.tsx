
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

  useEffect(() => {
    // Reset the redirect attempt flag when location changes
    setRedirectAttempted(false);
  }, [location.pathname]);

  // Prevent endless redirect loops by only attempting to redirect once per location
  // and adding a timeout to avoid too many history.replaceState calls
  if (!isLoading && authChecked && !userId && !redirectAttempted) {
    console.log("Usuario no autenticado, redirigiendo a /auth");
    setRedirectAttempted(true);
    
    // We'll return the Navigate component after a very brief delay
    // This helps prevent excessive history.replaceState() calls in quick succession
    setTimeout(() => {
      setRedirectAttempted(false); // Reset for potential future redirects
    }, 1000);
    
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still loading or authenticated, render children
  return <>{children}</>;
}
