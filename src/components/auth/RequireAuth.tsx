
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
  if (!isLoading && authChecked && !userId && !redirectAttempted) {
    console.log("Usuario no autenticado, redirigiendo a /auth");
    setRedirectAttempted(true);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still loading or authenticated, render children
  return <>{children}</>;
}
