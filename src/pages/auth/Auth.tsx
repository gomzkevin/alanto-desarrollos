
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { useAuth } from "@/hooks/useAuth";
import { InvitationAccept } from "@/components/auth/InvitationAccept";

// Create a type for the view toggle props
interface ViewToggleProps {
  onViewChange: () => void;
}

// Define props for the form components
interface LoginFormProps {
  onViewChange?: () => void;
}

interface SignupFormProps {
  onViewChange?: () => void;
}

export function AuthPage() {
  const [view, setView] = useState<"login" | "signup">("login");
  const { userId, isLoading } = useAuth({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Si el usuario está autenticado, redirige a la página principal
    if (userId && !isLoading) {
      // Obtener ruta de redirección de location.state o usar default
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [userId, isLoading, navigate, location.state]);

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
