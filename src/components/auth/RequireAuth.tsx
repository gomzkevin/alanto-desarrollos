
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { userId, authChecked, isLoading } = useUserRole();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check auth status only once we have definitive answer
  useEffect(() => {
    if (!isLoading && authChecked && !userId) {
      console.log("Usuario no autenticado, redirigiendo a /auth");
      setShouldRedirect(true);
    }
  }, [userId, authChecked, isLoading]);

  // Only return the Navigate component when shouldRedirect is true
  if (shouldRedirect) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Still loading or authenticated, render children
  return <>{children}</>;
}
