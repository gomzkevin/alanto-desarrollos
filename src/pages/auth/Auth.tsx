
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { InvitationAccept } from "@/components/auth/InvitationAccept";

// Update the LoginForm component type to match the props it can accept
interface LoginFormProps {
  onViewChange?: () => void;
  onSuccess?: () => void;
}

// Update the SignupForm component type to match the props it can accept
interface SignupFormProps {
  onViewChange?: () => void;
  onSuccess?: () => void;
}

export function AuthPage() {
  const [view, setView] = useState<"login" | "signup">("login");
  const { userId, isLoading, authChecked } = useAuth({});
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const redirectAttemptedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Si el usuario está autenticado, redirige a la página principal
    if (userId && !isLoading && authChecked && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      
      // Obtener ruta de redirección de location.state o usar default
      const from = location.state?.from?.pathname || "/dashboard";
      
      // Use a timeout to avoid immediate state changes that could cause excessive replaceState calls
      // Increase timeout to prevent too many redirects
      timeoutRef.current = setTimeout(() => {
        setShouldNavigate(true);
      }, 500);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [userId, isLoading, authChecked, location.state]);

  // Handle navigation in a separate effect to avoid loops
  useEffect(() => {
    if (shouldNavigate) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [shouldNavigate, navigate, location.state]);

  // Si está cargando, mostrar spinner
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

  // Renderizar formulario de login o registro basado en la ruta
  if (location.pathname === "/auth/invitation") {
    return <InvitationAccept />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md">
        {view === "login" ? (
          <LoginForm onViewChange={() => setView("signup")} />
        ) : (
          <SignupForm onViewChange={() => setView("login")} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
